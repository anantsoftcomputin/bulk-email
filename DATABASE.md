# Database Integration Guide

## Overview

This application uses **Dexie.js** (a wrapper around IndexedDB) to provide a robust, client-side database that works entirely in the browser. This solution is perfect for:

- ✅ Static hosting platforms (Netlify, Vercel, GitHub Pages)
- ✅ Offline-first applications
- ✅ No backend required
- ✅ SQL-like API for easy querying
- ✅ Automatic data persistence across sessions

## Why Dexie.js?

We chose Dexie.js over other solutions because:

1. **IndexedDB Native**: Built on browser's native IndexedDB (better than localStorage)
2. **Powerful Queries**: Supports complex queries, indexing, and compound queries
3. **Type-Safe**: Better TypeScript support than raw IndexedDB
4. **Transactions**: Automatic transaction management
5. **Promise-Based**: Modern async/await API
6. **Small Size**: Only ~20KB gzipped
7. **Production Ready**: Used by millions of users worldwide

## Database Schema

```javascript
{
  contacts: '++id, email, firstName, lastName, groupId, status, tags, createdAt, updatedAt',
  groups: '++id, name, description, createdAt, updatedAt',
  templates: '++id, name, subject, status, createdAt, updatedAt',
  campaigns: '++id, name, status, scheduledAt, sentAt, createdAt, updatedAt',
  campaignRecipients: '++id, campaignId, contactId, status, sentAt, openedAt, clickedAt',
  smtpConfigs: '++id, name, provider, isDefault, createdAt, updatedAt',
  analytics: '++id, campaignId, type, timestamp, data',
}
```

## Usage Examples

### Basic CRUD Operations

```javascript
import { dbHelpers } from './db/database';

// Create a contact
const contactId = await dbHelpers.createContact({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  groupId: 1,
  status: 'active',
  tags: ['newsletter', 'vip']
});

// Read contacts
const contacts = await dbHelpers.getAllContacts();
const contact = await dbHelpers.getContactById(1);

// Update contact
await dbHelpers.updateContact(1, {
  firstName: 'Jane',
  status: 'inactive'
});

// Delete contact
await dbHelpers.deleteContact(1);

// Search contacts
const results = await dbHelpers.searchContacts('john');
```

### Using with Zustand Stores

The application uses Zustand stores that are integrated with the database:

```javascript
import { useContactStore } from './store/contactStore.db';

function ContactsPage() {
  const { 
    contacts, 
    initializeContacts, 
    addContact, 
    deleteContact 
  } = useContactStore();

  useEffect(() => {
    // Load contacts from database on mount
    initializeContacts();
  }, []);

  const handleAddContact = async (data) => {
    await addContact(data);
  };

  return (
    <div>
      {contacts.map(contact => (
        <div key={contact.id}>{contact.email}</div>
      ))}
    </div>
  );
}
```

## Advanced Features

### Bulk Operations

```javascript
// Bulk delete
await dbHelpers.bulkDeleteContacts([1, 2, 3, 4]);

// Bulk insert (for imports)
await db.contacts.bulkAdd([
  { firstName: 'John', email: 'john@example.com' },
  { firstName: 'Jane', email: 'jane@example.com' },
]);
```

### Complex Queries

```javascript
// Get contacts by group
const groupContacts = await db.contacts
  .where('groupId')
  .equals(1)
  .toArray();

// Get active contacts
const activeContacts = await db.contacts
  .where('status')
  .equals('active')
  .toArray();

// Get campaigns sent in last 7 days
const lastWeek = new Date();
lastWeek.setDate(lastWeek.getDate() - 7);

const recentCampaigns = await db.campaigns
  .where('sentAt')
  .above(lastWeek.toISOString())
  .toArray();
```

### Transactions

```javascript
// Atomic operations
await db.transaction('rw', db.contacts, db.groups, async () => {
  const groupId = await db.groups.add({ name: 'VIP Customers' });
  await db.contacts.bulkAdd([
    { firstName: 'John', groupId },
    { firstName: 'Jane', groupId },
  ]);
});
```

## Data Export/Import

### Export Database

```javascript
import { dbHelpers } from './db/database';

// Export all data as JSON
const jsonData = await dbHelpers.exportDatabase();

// Download as file
const blob = new Blob([jsonData], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `backup-${new Date().toISOString()}.json`;
a.click();
```

### Import Database

```javascript
// From file input
const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  const text = await file.text();
  await dbHelpers.importDatabase(text);
};
```

## Browser Developer Tools

### View Data

1. Open Chrome DevTools (F12)
2. Go to "Application" tab
3. Expand "IndexedDB" in the sidebar
4. Click "BulkEmailSenderDB" to browse tables

### Clear Data

```javascript
// Clear all data
await dbHelpers.clearAllData();

// Or manually delete the database
await db.delete();
```

## Deployment Considerations

### Netlify Deployment

The database works perfectly on Netlify because:
- No server-side code required
- All data stored in user's browser
- Instant page loads (no API calls)
- Works offline after first visit

### Data Persistence

- Data persists across browser sessions
- Data is stored per-origin (domain)
- Users can export/import data for backup
- Data survives app updates

### Storage Limits

- Chrome: ~60% of disk space (10GB+ on most devices)
- Firefox: ~10% of disk space
- Safari: ~1GB
- Mobile browsers: varies (typically 50MB-500MB)

Check storage:

```javascript
if (navigator.storage && navigator.storage.estimate) {
  const { usage, quota } = await navigator.storage.estimate();
  console.log(`Using ${usage} of ${quota} bytes`);
}
```

## Sample Data

On first launch, the app automatically creates sample data:
- 5 sample contacts
- 3 contact groups
- 3 email templates
- 4 campaigns (draft, scheduled, sending, sent)

This helps new users understand the app immediately.

## Migration from SQLite

If you need to migrate to a real SQLite database in the future:

1. The schema is already designed to match SQL conventions
2. Export data using `dbHelpers.exportDatabase()`
3. Import JSON into SQLite using a script
4. Swap out Dexie calls with SQLite queries

Example migration script:

```javascript
// Node.js script to import data into SQLite
const sqlite3 = require('sqlite3');
const fs = require('fs');

const db = new sqlite3.Database('emails.db');
const data = JSON.parse(fs.readFileSync('backup.json', 'utf8'));

db.serialize(() => {
  // Create tables
  db.run(`CREATE TABLE contacts (...)`);
  
  // Insert data
  const stmt = db.prepare('INSERT INTO contacts VALUES (?, ?, ?, ...)');
  data.contacts.forEach(contact => {
    stmt.run(contact.id, contact.firstName, contact.email, ...);
  });
  stmt.finalize();
});
```

## Performance Tips

1. **Use Indices**: Already configured for common queries
2. **Batch Operations**: Use `bulkAdd` instead of multiple `add()` calls
3. **Limit Results**: Use `.limit()` for large datasets
4. **Optimize Filters**: Filter in database, not in JavaScript
5. **Avoid Large Objects**: Store large files separately (use IndexedDB for metadata only)

## Troubleshooting

### Database Not Loading

```javascript
// Check if IndexedDB is supported
if (!window.indexedDB) {
  alert('Your browser doesn\'t support IndexedDB');
}

// Check for errors
db.on('versionchange', () => {
  console.log('Database version changed');
});
```

### Clear Corrupted Database

```javascript
// Delete and reinitialize
await db.delete();
window.location.reload();
```

### Debugging Queries

```javascript
// Enable debug mode
Dexie.debug = true; // Shows all queries in console
```

## Best Practices

1. ✅ Always use transactions for multi-table operations
2. ✅ Add error handling to all database calls
3. ✅ Use async/await for better readability
4. ✅ Index fields used in queries
5. ✅ Validate data before inserting
6. ✅ Provide export/import for user data backup
7. ✅ Show loading states during database operations
8. ✅ Handle offline scenarios gracefully

## Alternative: sql.js

If you need true SQL syntax, you can use sql.js (SQLite compiled to WebAssembly):

```javascript
import initSqlJs from 'sql.js';

const SQL = await initSqlJs({
  locateFile: file => `https://sql.js.org/dist/${file}`
});

const db = new SQL.Database();
db.run('CREATE TABLE contacts (id INTEGER, email TEXT)');
db.run('INSERT INTO contacts VALUES (1, "john@example.com")');
const result = db.exec('SELECT * FROM contacts');
```

However, Dexie.js is recommended because:
- Better performance (native IndexedDB vs WASM)
- Smaller bundle size
- Better browser support
- More idiomatic JavaScript API

## Resources

- [Dexie.js Documentation](https://dexie.org/)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Browser Storage Limits](https://web.dev/storage-for-the-web/)
