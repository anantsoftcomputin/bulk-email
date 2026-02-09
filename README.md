# Bulk Email Sender

A professional, feature-rich bulk email sending application built with React, Vite, and modern web technologies. Send personalized email campaigns to thousands of contacts with advanced analytics and reporting.

## 🚀 Features

### Contact Management
- **Import Contacts**: Upload contacts from CSV, Excel, or JSON files
- **Export Contacts**: Export your contact list in multiple formats
- **Contact Groups**: Organize contacts into groups for targeted campaigns
- **Custom Fields**: Add custom fields to contacts for better personalization
- **Bulk Operations**: Perform bulk actions on multiple contacts at once

### Email Templates
- **Visual Editor**: Create beautiful email templates with HTML support
- **Template Variables**: Use dynamic variables like {{firstName}}, {{lastName}}, {{company}}
- **Template Library**: Save and reuse templates across campaigns
- **Preview Mode**: Preview emails before sending

### Campaign Management
- **Campaign Wizard**: Step-by-step campaign creation process
- **Scheduled Sending**: Schedule campaigns for future dates
- **A/B Testing**: Test different subject lines and content
- **Recipient Targeting**: Send to specific contacts or groups
- **Campaign Analytics**: Track opens, clicks, bounces, and more

### SMTP Configuration
- **Multiple SMTP Providers**: Support for Gmail, SendGrid, Mailgun, AWS SES, and custom SMTP
- **Connection Testing**: Test SMTP configurations before use
- **Multiple Configurations**: Manage multiple SMTP accounts
- **Auto-failover**: Automatic fallback to backup SMTP servers

### Analytics & Reporting
- **Real-time Dashboard**: Monitor campaign performance in real-time
- **Detailed Metrics**: Track delivery rates, open rates, click rates, and bounce rates
- **Visual Charts**: Beautiful charts and graphs powered by Recharts
- **Export Reports**: Export analytics data to CSV or Excel
- **Timeline View**: See campaign performance over time

### Advanced Features
- **Rate Limiting**: Control sending speed to avoid spam filters
- **Personalization**: Merge tags for personalized content
- **Unsubscribe Management**: Built-in unsubscribe handling
- **Bounce Management**: Automatic handling of bounced emails
- **List Segmentation**: Target specific segments of your audience
- **Responsive Design**: Works perfectly on desktop and mobile

## 🛠️ Tech Stack

- **Frontend Framework**: React 19
- **Build Tool**: Vite
- **Routing**: React Router v7
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Database**: Dexie.js (IndexedDB wrapper) - Client-side SQL-like database
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Date Handling**: date-fns
- **File Parsing**: PapaParse (CSV), ExcelJS (Excel)

## 💾 Database

This application uses **Dexie.js** (a powerful wrapper around IndexedDB) for data persistence. This means:

- ✅ **No Backend Required**: All data is stored locally in your browser
- ✅ **Offline Support**: Works completely offline after first load
- ✅ **Fast Performance**: Instant queries with no network latency
- ✅ **Easy Deployment**: Deploy to Netlify, Vercel, or any static host
- ✅ **SQL-like Queries**: Familiar database operations with modern JavaScript API
- ✅ **Sample Data**: Automatically loads sample contacts, templates, and campaigns on first use

### Database Features

- **Full CRUD Operations**: Create, read, update, and delete records
- **Complex Queries**: Search, filter, and sort with indexed fields
- **Transactions**: Atomic operations for data consistency
- **Export/Import**: Backup and restore your entire database
- **No Storage Limits**: Typically 10GB+ storage available (browser dependent)

For detailed database documentation, see [DATABASE.md](DATABASE.md).

## 📦 Installation

### Quick Start (Development)

1. **Clone the repository**:
```bash
git clone <repository-url>
cd bulk-email-sender
```

2. **Install frontend dependencies**:
```bash
npm install
```

3. **Install backend dependencies**:
```bash
cd server
npm install
cd ..
```

4. **Create environment file**:
Create a `.env` file in the root directory:
```env
VITE_API_URL=http://localhost:3001/api

# Firebase Configuration
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

5. **Start the application**:

**Terminal 1** - Start backend server:
```bash
cd server
npm start
```

**Terminal 2** - Start frontend dev server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### 🚀 Deploy to Netlify

For production deployment to Netlify, see **[DEPLOYMENT.md](DEPLOYMENT.md)** for complete instructions.

**TL;DR**: Push to GitHub → Connect to Netlify → Set environment variables → Deploy!

The app automatically uses:
- **Local Dev**: Node.js Express backend (`localhost:3001`)
- **Production**: Netlify Serverless Functions (`/.netlify/functions`)

## 🏗️ Project Structure

```
bulk-email-sender/
├── src/
│   ├── api/              # API service layer
│   │   ├── campaigns.js
│   │   ├── contacts.js
│   │   ├── templates.js
│   │   ├── smtp.js
│   │   └── analytics.js
│   ├── components/       # React components
│   │   ├── common/       # Reusable UI components
│   │   ├── layout/       # Layout components
│   │   ├── contacts/     # Contact-related components
│   │   ├── campaigns/    # Campaign-related components
│   │   ├── templates/    # Template-related components
│   │   └── analytics/    # Analytics components
│   ├── pages/            # Page components
│   │   ├── Dashboard.jsx
│   │   ├── Contacts.jsx
│   │   ├── Campaigns.jsx
│   │   ├── Templates.jsx
│   │   ├── Analytics.jsx
│   │   └── Settings.jsx
│   ├── store/            # Zustand state management
│   │   ├── authStore.js
│   │   ├── contactStore.js
│   │   ├── campaignStore.js
│   │   ├── templateStore.js
│   │   └── uiStore.js
│   ├── utils/            # Utility functions
│   │   ├── constants.js
│   │   ├── validation.js
│   │   ├── emailHelpers.js
│   │   ├── importHelpers.js
│   │   └── exportHelpers.js
│   ├── App.jsx           # Main application component
│   └── main.jsx          # Application entry point
├── public/               # Static assets
├── index.html            # HTML template
├── vite.config.js        # Vite configuration
├── tailwind.config.js    # Tailwind CSS configuration
└── package.json          # Project dependencies
```

## 🎯 Usage

### Creating a Contact

1. Navigate to **Contacts** page
2. Click **"Add Contact"** button
3. Fill in contact details (email is required)
4. Click **"Save"**

### Importing Contacts

1. Go to **Contacts** page
2. Click **"Import"** button
3. Select CSV, Excel, or JSON file
4. Review the import preview
5. Click **"Import"** to add contacts

### Creating an Email Template

1. Navigate to **Templates** page
2. Click **"Create Template"**
3. Enter template name and subject
4. Write HTML content (use {{variableName}} for personalization)
5. Click **"Save"**

### Configuring SMTP

1. Go to **SMTP Settings** page
2. Click **"Add Configuration"**
3. Enter SMTP details (host, port, username, password)
4. Test the configuration
5. Click **"Save"**

### Running a Campaign

1. Navigate to **Campaigns** page
2. Click **"Create Campaign"**
3. Enter campaign details
4. Select template
5. Choose recipients (contacts or groups)
6. Select SMTP configuration
7. Review and send or schedule

### Viewing Analytics

1. Go to **Analytics** page
2. View overall statistics
3. Check campaign performance charts
4. Export reports if needed

## 🔧 Configuration

### SMTP Providers

The application supports the following SMTP providers:

- **Gmail**: smtp.gmail.com:587
- **SendGrid**: smtp.sendgrid.net:587
- **Mailgun**: smtp.mailgun.org:587
- **AWS SES**: email-smtp.us-east-1.amazonaws.com:587
- **Custom**: Configure any SMTP server

### Template Variables

Use these variables in your templates for personalization:

- `{{firstName}}` - Contact's first name
- `{{lastName}}` - Contact's last name
- `{{email}}` - Contact's email address
- `{{company}}` - Contact's company name
- `{{phone}}` - Contact's phone number
- Custom fields can also be used

## 📊 API Integration

To connect to a backend API:

1. Update `VITE_API_URL` in `.env` file
2. Implement backend endpoints matching the API structure in `src/api/`
3. The application expects REST API endpoints for:
   - Contacts: `/api/contacts`
   - Campaigns: `/api/campaigns`
   - Templates: `/api/templates`
   - SMTP: `/api/smtp`
   - Analytics: `/api/analytics`

## 🚀 Building for Production

```bash
# Build the application
npm run build

# Preview production build
npm run preview
```

The built files will be in the `dist/` directory.

## 🔐 Security Best Practices

- Store SMTP credentials securely on the backend
- Implement rate limiting to prevent abuse
- Use environment variables for sensitive data
- Validate all user inputs
- Implement proper authentication and authorization
- Use HTTPS in production
- Sanitize HTML content to prevent XSS attacks

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues, questions, or suggestions, please open an issue on GitHub.

## ⭐ Features Roadmap

- [ ] Email template builder with drag-and-drop
- [ ] Advanced segmentation rules
- [ ] Email warmup functionality
- [ ] Integration with CRM systems
- [ ] Multi-language support
- [ ] Dark mode theme
- [ ] Mobile app
- [ ] Webhook support
- [ ] Custom domains
- [ ] Team collaboration features

---

**Note**: This is a frontend application. For full functionality, you need to implement a backend API that handles email sending, data persistence, and authentication.
