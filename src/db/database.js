// ─────────────────────────────────────────────────────────────────────────────
// Database layer using Firebase Firestore (replaces IndexedDB / Dexie.js)
//
// All data is stored per-user under:  users/{userId}/{collection}/{docId}
// This gives every user their own isolated data that syncs across devices.
//
// EXPORTS THE SAME API as the old IndexedDB version so all stores/pages
// continue to work with zero changes.
// ─────────────────────────────────────────────────────────────────────────────

import { firestore, auth } from '../config/firebase';
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  writeBatch,
} from 'firebase/firestore';

// ─── Helper: get the current user's UID (throws if not logged in) ──────────
function uid() {
  const u = auth.currentUser;
  if (!u) throw new Error('Not authenticated – cannot access database');
  return u.uid;
}

// ─── Helper: reference to a user-scoped collection ─────────────────────────
function userCol(collectionName) {
  return collection(firestore, 'users', uid(), collectionName);
}
function userDoc(collectionName, docId) {
  return doc(firestore, 'users', uid(), collectionName, String(docId));
}

// ─── Helper: convert Firestore doc → plain object with `id` ────────────────
function docToObj(snap) {
  if (!snap.exists()) return null;
  const data = snap.data();
  return { ...data, id: snap.id };
}
function docsToArray(snapshot) {
  return snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
}

// ─── Compatibility shim ────────────────────────────────────────────────────
// Some pages import `db` directly for raw Dexie-style queries
// (e.g. `db.emailQueue.where(…).equals(…).toArray()`).
// We expose a lightweight proxy that maps those chains into Firestore queries so
// existing pages continue working without changes.
// ─────────────────────────────────────────────────────────────────────────────

function createCollectionProxy(collectionName) {
  return {
    // db.<col>.toArray()
    async toArray() {
      const snap = await getDocs(userCol(collectionName));
      return docsToArray(snap);
    },

    // db.<col>.count()
    async count() {
      const snap = await getDocs(userCol(collectionName));
      return snap.size;
    },

    // db.<col>.get(id)
    async get(id) {
      if (id === undefined || id === null) return null;
      const snap = await getDoc(userDoc(collectionName, id));
      return docToObj(snap);
    },

    // db.<col>.add(obj) → returns new doc ID
    async add(obj) {
      const ref = await addDoc(userCol(collectionName), { ...obj });
      return ref.id;
    },

    // db.<col>.bulkAdd(arr)
    async bulkAdd(arr) {
      const ids = [];
      // Firestore batches max 500 writes – chunk if needed
      for (let i = 0; i < arr.length; i += 400) {
        const batch = writeBatch(firestore);
        const chunk = arr.slice(i, i + 400);
        for (const item of chunk) {
          const ref = doc(userCol(collectionName));
          batch.set(ref, { ...item });
          ids.push(ref.id);
        }
        await batch.commit();
      }
      return ids;
    },

    // db.<col>.bulkPut(arr) – upsert; items need .id
    async bulkPut(arr) {
      for (let i = 0; i < arr.length; i += 400) {
        const batch = writeBatch(firestore);
        const chunk = arr.slice(i, i + 400);
        for (const item of chunk) {
          const { id: docId, ...rest } = item;
          const ref = docId ? userDoc(collectionName, docId) : doc(userCol(collectionName));
          batch.set(ref, rest, { merge: true });
        }
        await batch.commit();
      }
    },

    // db.<col>.put(obj)
    async put(obj) {
      const { key, id: docId, ...rest } = obj;
      const idToUse = key || docId;
      if (idToUse) {
        await setDoc(userDoc(collectionName, idToUse), rest, { merge: true });
      } else {
        await addDoc(userCol(collectionName), rest);
      }
    },

    // db.<col>.update(id, updates)
    async update(id, updates) {
      await updateDoc(userDoc(collectionName, id), updates);
    },

    // db.<col>.delete(id)
    async delete(id) {
      await deleteDoc(userDoc(collectionName, id));
    },

    // db.<col>.bulkDelete(ids)
    async bulkDelete(ids) {
      for (let i = 0; i < ids.length; i += 400) {
        const batch = writeBatch(firestore);
        ids.slice(i, i + 400).forEach(id => batch.delete(userDoc(collectionName, id)));
        await batch.commit();
      }
    },

    // db.<col>.clear()
    async clear() {
      const snap = await getDocs(userCol(collectionName));
      if (snap.empty) return;
      for (let i = 0; i < snap.docs.length; i += 400) {
        const batch = writeBatch(firestore);
        snap.docs.slice(i, i + 400).forEach(d => batch.delete(d.ref));
        await batch.commit();
      }
    },

    // db.<col>.where('field').equals(val)  →  chainable
    where(field) {
      return {
        equals(val) {
          const q = query(userCol(collectionName), where(field, '==', val));
          // Helper: fetch filtered results
          const fetchFiltered = async () => {
            const snap = await getDocs(q);
            return docsToArray(snap);
          };
          return {
            async toArray() {
              return fetchFiltered();
            },
            async delete() {
              const snap = await getDocs(q);
              if (snap.empty) return;
              for (let i = 0; i < snap.docs.length; i += 400) {
                const batch = writeBatch(firestore);
                snap.docs.slice(i, i + 400).forEach(d => batch.delete(d.ref));
                await batch.commit();
              }
            },
            async sortBy(sortField) {
              const arr = await fetchFiltered();
              return arr.sort((a, b) => {
                if (a[sortField] < b[sortField]) return -1;
                if (a[sortField] > b[sortField]) return 1;
                return 0;
              });
            },
            // Support chaining: .where().equals().orderBy().reverse().limit().toArray()
            orderBy(sortField) {
              return {
                reverse() {
                  return {
                    limit(n) {
                      return {
                        async toArray() {
                          const arr = await fetchFiltered();
                          arr.sort((a, b) => (a[sortField] > b[sortField] ? -1 : a[sortField] < b[sortField] ? 1 : 0));
                          return arr.slice(0, n);
                        },
                      };
                    },
                    async toArray() {
                      const arr = await fetchFiltered();
                      arr.sort((a, b) => (a[sortField] > b[sortField] ? -1 : a[sortField] < b[sortField] ? 1 : 0));
                      return arr;
                    },
                  };
                },
                async toArray() {
                  const arr = await fetchFiltered();
                  arr.sort((a, b) => (a[sortField] < b[sortField] ? -1 : a[sortField] > b[sortField] ? 1 : 0));
                  return arr;
                },
              };
            },
          };
        },
        between(start, end, startInclusive = true, endInclusive = true) {
          return {
            async toArray() {
              const snap = await getDocs(userCol(collectionName));
              return docsToArray(snap).filter(item => {
                const val = item[field];
                const afterStart = startInclusive ? val >= start : val > start;
                const beforeEnd = endInclusive ? val <= end : val < end;
                return afterStart && beforeEnd;
              });
            },
          };
        },
      };
    },

    // db.<col>.orderBy('field')  — with chaining for .reverse().limit(n).toArray()
    orderBy(field) {
      return {
        reverse() {
          return {
            limit(n) {
              return {
                async toArray() {
                  const snap = await getDocs(userCol(collectionName));
                  const arr = docsToArray(snap);
                  arr.sort((a, b) => (a[field] > b[field] ? -1 : a[field] < b[field] ? 1 : 0));
                  return arr.slice(0, n);
                },
              };
            },
            async toArray() {
              const snap = await getDocs(userCol(collectionName));
              const arr = docsToArray(snap);
              arr.sort((a, b) => (a[field] > b[field] ? -1 : a[field] < b[field] ? 1 : 0));
              return arr;
            },
          };
        },
        async toArray() {
          const snap = await getDocs(userCol(collectionName));
          const arr = docsToArray(snap);
          arr.sort((a, b) => (a[field] < b[field] ? -1 : a[field] > b[field] ? 1 : 0));
          return arr;
        },
      };
    },

    // db.<col>.filter(fn).toArray()
    filter(fn) {
      return {
        async toArray() {
          const snap = await getDocs(userCol(collectionName));
          return docsToArray(snap).filter(fn);
        },
      };
    },

    // db.<col>.toCollection().modify(changes)
    toCollection() {
      return {
        async modify(changes) {
          const snap = await getDocs(userCol(collectionName));
          if (snap.empty) return;
          for (let i = 0; i < snap.docs.length; i += 400) {
            const batch = writeBatch(firestore);
            snap.docs.slice(i, i + 400).forEach(d => batch.update(d.ref, changes));
            await batch.commit();
          }
        },
      };
    },
  };
}

// ─── The `db` object (drop-in replacement for the Dexie instance) ──────────
export const db = {
  contacts: createCollectionProxy('contacts'),
  groups: createCollectionProxy('groups'),
  templates: createCollectionProxy('templates'),
  campaigns: createCollectionProxy('campaigns'),
  campaignRecipients: createCollectionProxy('campaignRecipients'),
  smtpConfigs: createCollectionProxy('smtpConfigs'),
  analytics: createCollectionProxy('analytics'),
  trackingEvents: createCollectionProxy('trackingEvents'),
  settings: createCollectionProxy('settings'),
  emailQueue: createCollectionProxy('emailQueue'),
};

// ─── dbHelpers (exact same API as the old IndexedDB version) ────────────────
export const dbHelpers = {

  // ── Contacts ──────────────────────────────────────────────────
  async getAllContacts() {
    const snap = await getDocs(userCol('contacts'));
    const arr = docsToArray(snap);
    arr.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
    return arr;
  },

  async getContactById(id) {
    const snap = await getDoc(userDoc('contacts', id));
    return docToObj(snap);
  },

  async createContact(contact) {
    const now = new Date().toISOString();
    const ref = await addDoc(userCol('contacts'), {
      ...contact,
      createdAt: now,
      updatedAt: now,
      status: contact.status || 'active',
    });
    return ref.id;
  },

  async updateContact(id, updates) {
    const ref = userDoc('contacts', id);
    await updateDoc(ref, { ...updates, updatedAt: new Date().toISOString() });
    const snap = await getDoc(ref);
    return docToObj(snap);
  },

  async deleteContact(id) {
    await deleteDoc(userDoc('contacts', id));
  },

  async bulkDeleteContacts(ids) {
    for (let i = 0; i < ids.length; i += 400) {
      const batch = writeBatch(firestore);
      ids.slice(i, i + 400).forEach(id => batch.delete(userDoc('contacts', id)));
      await batch.commit();
    }
  },

  async searchContacts(queryStr) {
    const lower = queryStr.toLowerCase();
    const snap = await getDocs(userCol('contacts'));
    return docsToArray(snap).filter(c =>
      c.email?.toLowerCase().includes(lower) ||
      c.firstName?.toLowerCase().includes(lower) ||
      c.lastName?.toLowerCase().includes(lower)
    );
  },

  // ── Groups ────────────────────────────────────────────────────
  async getAllGroups() {
    const snap = await getDocs(userCol('groups'));
    const arr = docsToArray(snap);
    arr.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
    return arr;
  },

  async getGroupById(id) {
    const snap = await getDoc(userDoc('groups', id));
    return docToObj(snap);
  },

  async createGroup(group) {
    const now = new Date().toISOString();
    const ref = await addDoc(userCol('groups'), {
      ...group,
      createdAt: now,
      updatedAt: now,
    });
    return ref.id;
  },

  async updateGroup(id, updates) {
    const ref = userDoc('groups', id);
    await updateDoc(ref, { ...updates, updatedAt: new Date().toISOString() });
    const snap = await getDoc(ref);
    return docToObj(snap);
  },

  async deleteGroup(id) {
    await deleteDoc(userDoc('groups', id));
  },

  async getGroupContacts(groupId) {
    const snap = await getDocs(userCol('contacts'));
    return docsToArray(snap).filter(c => c.groupId === groupId || String(c.groupId) === String(groupId));
  },

  // ── Templates ─────────────────────────────────────────────────
  async getAllTemplates() {
    const snap = await getDocs(userCol('templates'));
    const arr = docsToArray(snap);
    arr.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
    return arr;
  },

  async getTemplateById(id) {
    const snap = await getDoc(userDoc('templates', id));
    return docToObj(snap);
  },

  async createTemplate(template) {
    const now = new Date().toISOString();
    const ref = await addDoc(userCol('templates'), {
      ...template,
      createdAt: now,
      updatedAt: now,
      status: template.status || 'draft',
    });
    return ref.id;
  },

  async updateTemplate(id, updates) {
    const ref = userDoc('templates', id);
    await updateDoc(ref, { ...updates, updatedAt: new Date().toISOString() });
    const snap = await getDoc(ref);
    return docToObj(snap);
  },

  async deleteTemplate(id) {
    await deleteDoc(userDoc('templates', id));
  },

  // ── Campaigns ─────────────────────────────────────────────────
  async getAllCampaigns() {
    const snap = await getDocs(userCol('campaigns'));
    const arr = docsToArray(snap);
    arr.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
    return arr;
  },

  async getCampaignById(id) {
    const snap = await getDoc(userDoc('campaigns', id));
    return docToObj(snap);
  },

  async createCampaign(campaign) {
    const now = new Date().toISOString();
    const ref = await addDoc(userCol('campaigns'), {
      ...campaign,
      createdAt: now,
      updatedAt: now,
      status: campaign.status || 'draft',
    });
    return ref.id;
  },

  async updateCampaign(id, updates) {
    const ref = userDoc('campaigns', id);
    await updateDoc(ref, { ...updates, updatedAt: new Date().toISOString() });
    const snap = await getDoc(ref);
    return docToObj(snap);
  },

  async deleteCampaign(id) {
    // Delete associated recipients first
    const recipSnap = await getDocs(userCol('campaignRecipients'));
    const toDelete = recipSnap.docs.filter(d => {
      const data = d.data();
      return data.campaignId === id || String(data.campaignId) === String(id);
    });
    if (toDelete.length) {
      for (let i = 0; i < toDelete.length; i += 400) {
        const batch = writeBatch(firestore);
        toDelete.slice(i, i + 400).forEach(d => batch.delete(d.ref));
        await batch.commit();
      }
    }
    await deleteDoc(userDoc('campaigns', id));
  },

  async getCampaignRecipients(campaignId) {
    const snap = await getDocs(userCol('campaignRecipients'));
    return docsToArray(snap).filter(
      r => r.campaignId === campaignId || String(r.campaignId) === String(campaignId)
    );
  },

  async addCampaignRecipient(recipient) {
    const ref = await addDoc(userCol('campaignRecipients'), { ...recipient });
    return ref.id;
  },

  async updateCampaignRecipient(id, updates) {
    await updateDoc(userDoc('campaignRecipients', id), updates);
  },

  // ── SMTP Configs ──────────────────────────────────────────────
  async getAllSMTPConfigs() {
    const snap = await getDocs(userCol('smtpConfigs'));
    const arr = docsToArray(snap);
    arr.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
    return arr;
  },

  async getSMTPConfigById(id) {
    const snap = await getDoc(userDoc('smtpConfigs', id));
    return docToObj(snap);
  },

  async getDefaultSMTPConfig() {
    try {
      const snap = await getDocs(userCol('smtpConfigs'));
      const configs = docsToArray(snap);
      const defaultConfig = configs.find(c => c.isDefault === true) || configs[0];
      console.log('Found SMTP config:', defaultConfig?.name || 'None');
      return defaultConfig || null;
    } catch (error) {
      console.error('Error getting default SMTP config:', error);
      return null;
    }
  },

  async createSMTPConfig(config) {
    const now = new Date().toISOString();
    if (config.isDefault) {
      const snap = await getDocs(userCol('smtpConfigs'));
      if (!snap.empty) {
        const batch = writeBatch(firestore);
        snap.docs.forEach(d => batch.update(d.ref, { isDefault: false }));
        await batch.commit();
      }
    }
    const ref = await addDoc(userCol('smtpConfigs'), { ...config, createdAt: now, updatedAt: now });
    return ref.id;
  },

  async updateSMTPConfig(id, updates) {
    if (updates.isDefault) {
      const snap = await getDocs(userCol('smtpConfigs'));
      if (!snap.empty) {
        const batch = writeBatch(firestore);
        snap.docs.forEach(d => batch.update(d.ref, { isDefault: false }));
        await batch.commit();
      }
    }
    const ref = userDoc('smtpConfigs', id);
    await updateDoc(ref, { ...updates, updatedAt: new Date().toISOString() });
    const snap = await getDoc(ref);
    return docToObj(snap);
  },

  async deleteSMTPConfig(id) {
    await deleteDoc(userDoc('smtpConfigs', id));
  },

  // ── Analytics ─────────────────────────────────────────────────
  async addAnalyticsEvent(event) {
    const ref = await addDoc(userCol('analytics'), {
      ...event,
      timestamp: new Date().toISOString(),
    });
    return ref.id;
  },

  async getCampaignAnalytics(campaignId) {
    const snap = await getDocs(userCol('analytics'));
    return docsToArray(snap).filter(
      a => a.campaignId === campaignId || String(a.campaignId) === String(campaignId)
    );
  },

  async getAnalyticsByDateRange(startDate, endDate) {
    const start = startDate.toISOString();
    const end = endDate.toISOString();
    const snap = await getDocs(userCol('analytics'));
    return docsToArray(snap).filter(a => a.timestamp >= start && a.timestamp <= end);
  },

  // ── Settings ──────────────────────────────────────────────────
  async getSetting(key) {
    try {
      const snap = await getDoc(userDoc('settings', key));
      if (!snap.exists()) return null;
      return snap.data().value;
    } catch {
      return null;
    }
  },

  async setSetting(key, value) {
    await setDoc(userDoc('settings', key), {
      key,
      value,
      updatedAt: new Date().toISOString(),
    });
  },

  async getAllSettings() {
    const snap = await getDocs(userCol('settings'));
    const result = {};
    snap.docs.forEach(d => {
      const data = d.data();
      result[data.key || d.id] = data.value;
    });
    return result;
  },

  // ── Email Queue ───────────────────────────────────────────────
  async addToEmailQueue(queueItem) {
    const ref = await addDoc(userCol('emailQueue'), {
      ...queueItem,
      status: queueItem.status || 'pending',
      priority: queueItem.priority || 1,
      retryCount: 0,
      createdAt: new Date().toISOString(),
    });
    return ref.id;
  },

  async getEmailQueuePending(limitCount = 10) {
    const snap = await getDocs(userCol('emailQueue'));
    const pending = docsToArray(snap)
      .filter(e => e.status === 'pending')
      .sort((a, b) => (a.priority || 0) - (b.priority || 0));
    return pending.slice(0, limitCount);
  },

  async updateEmailQueueStatus(id, status, error = null) {
    const updates = { status };
    if (status === 'sent') {
      updates.sentAt = new Date().toISOString();
    }
    if (error) {
      updates.error = error;
      const snap = await getDoc(userDoc('emailQueue', id));
      const data = snap.exists() ? snap.data() : {};
      updates.retryCount = (data.retryCount || 0) + 1;
    }
    await updateDoc(userDoc('emailQueue', id), updates);
  },

  async getEmailQueueStats() {
    const snap = await getDocs(userCol('emailQueue'));
    const all = docsToArray(snap);
    return {
      pending: all.filter(e => e.status === 'pending').length,
      processing: all.filter(e => e.status === 'processing').length,
      sent: all.filter(e => e.status === 'sent').length,
      failed: all.filter(e => e.status === 'failed').length,
    };
  },

  // ── Utility ───────────────────────────────────────────────────
  async clearAllData() {
    const collections = ['contacts', 'groups', 'templates', 'campaigns', 'campaignRecipients', 'smtpConfigs', 'analytics', 'emailQueue'];
    for (const col of collections) {
      const snap = await getDocs(userCol(col));
      if (snap.empty) continue;
      for (let i = 0; i < snap.docs.length; i += 400) {
        const batch = writeBatch(firestore);
        snap.docs.slice(i, i + 400).forEach(d => batch.delete(d.ref));
        await batch.commit();
      }
    }
  },

  async exportDatabase() {
    const data = {};
    const collections = ['contacts', 'groups', 'templates', 'campaigns', 'campaignRecipients', 'smtpConfigs', 'analytics'];
    for (const col of collections) {
      const snap = await getDocs(userCol(col));
      data[col] = docsToArray(snap);
    }
    return JSON.stringify(data, null, 2);
  },

  async importDatabase(jsonData) {
    const data = JSON.parse(jsonData);
    for (const [colName, items] of Object.entries(data)) {
      if (!Array.isArray(items)) continue;
      for (let i = 0; i < items.length; i += 400) {
        const batch = writeBatch(firestore);
        const chunk = items.slice(i, i + 400);
        for (const item of chunk) {
          const { id: docId, ...rest } = item;
          const ref = docId ? userDoc(colName, docId) : doc(userCol(colName));
          batch.set(ref, rest, { merge: true });
        }
        await batch.commit();
      }
    }
  },

  // ── Tracking Events ───────────────────────────────────────────
  async getTrackingEvents(campaignId) {
    try {
      const snap = await getDocs(userCol('trackingEvents'));
      const events = docsToArray(snap);
      // Filter by campaignId if provided
      if (campaignId) {
        return events.filter(
          e => e.campaignId === campaignId || String(e.campaignId) === String(campaignId)
        );
      }
      return events;
    } catch (error) {
      console.error('Error getting tracking events:', error);
      return [];
    }
  },

  async getTrackingEventsByCampaign(campaignId) {
    return this.getTrackingEvents(campaignId);
  },
};

// ─── Initialize sample data (once per user) ─────────────────────────────────
export async function initializeSampleData() {
  try {
    const initialized = await dbHelpers.getSetting('dataInitialized');
    if (initialized) return;

    // Check if user already has contacts
    const contactSnap = await getDocs(userCol('contacts'));
    if (contactSnap.size > 0) {
      await dbHelpers.setSetting('dataInitialized', true);
      return;
    }

    const now = new Date().toISOString();

    // Sample groups
    const groupIds = [];
    const groups = [
      { name: 'Newsletter Subscribers', description: 'Users subscribed to our newsletter', createdAt: now, updatedAt: now },
      { name: 'Premium Users', description: 'Paying customers', createdAt: now, updatedAt: now },
      { name: 'Beta Testers', description: 'Users testing new features', createdAt: now, updatedAt: now },
    ];
    for (const g of groups) {
      const ref = await addDoc(userCol('groups'), g);
      groupIds.push(ref.id);
    }

    // Sample contacts
    const contacts = [
      { firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', phone: '+1234567890', company: 'Tech Corp', groupId: groupIds[0], status: 'active', tags: ['vip', 'newsletter'], createdAt: now, updatedAt: now },
      { firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com', phone: '+1234567891', company: 'Design Studio', groupId: groupIds[0], status: 'active', tags: ['newsletter'], createdAt: now, updatedAt: now },
      { firstName: 'Bob', lastName: 'Johnson', email: 'bob.johnson@example.com', company: 'Startup Inc', groupId: groupIds[1], status: 'active', tags: ['premium', 'enterprise'], createdAt: now, updatedAt: now },
      { firstName: 'Alice', lastName: 'Williams', email: 'alice.williams@example.com', groupId: groupIds[2], status: 'active', tags: ['beta'], createdAt: now, updatedAt: now },
      { firstName: 'Charlie', lastName: 'Brown', email: 'charlie.brown@example.com', company: 'Marketing Agency', groupId: groupIds[0], status: 'unsubscribed', tags: [], createdAt: now, updatedAt: now },
    ];
    for (const c of contacts) {
      await addDoc(userCol('contacts'), c);
    }

    // Sample templates
    const templateData = [
      { name: 'Welcome Email', subject: 'Welcome to {{company_name}}!', body: '<p>Hi {{first_name}},</p><p>Welcome to our platform!</p>', variables: ['first_name', 'company_name'], status: 'active', createdAt: now, updatedAt: now },
      { name: 'Newsletter Template', subject: '{{newsletter_title}} - {{month}} Edition', body: '<h1>{{newsletter_title}}</h1><p>Dear {{first_name}},</p><p>Check out our latest updates...</p>', variables: ['first_name', 'newsletter_title', 'month'], status: 'active', createdAt: now, updatedAt: now },
      { name: 'Promotional Campaign', subject: 'Special Offer: {{discount}}% Off!', body: '<p>Hi {{first_name}},</p><p>Get {{discount}}% off! Use code: {{promo_code}}</p>', variables: ['first_name', 'discount', 'promo_code'], status: 'draft', createdAt: now, updatedAt: now },
    ];
    const templateIds = [];
    for (const t of templateData) {
      const ref = await addDoc(userCol('templates'), t);
      templateIds.push(ref.id);
    }

    // Sample campaigns
    const nowDate = new Date();
    const campaigns = [
      { name: 'Q1 Newsletter', subject: 'Our Q1 Updates', templateId: templateIds[1], groupIds: [groupIds[0]], status: 'sent', scheduledAt: new Date(nowDate.getTime() - 7 * 86400000).toISOString(), sentAt: new Date(nowDate.getTime() - 7 * 86400000).toISOString(), stats: { total: 100, sent: 100, delivered: 98, opened: 75, clicked: 45, bounced: 2, failed: 0 }, createdAt: now, updatedAt: now },
      { name: 'Welcome Campaign', subject: 'Welcome to Our Platform', templateId: templateIds[0], groupIds: [groupIds[0], groupIds[2]], status: 'scheduled', scheduledAt: new Date(nowDate.getTime() + 2 * 86400000).toISOString(), stats: { total: 50, sent: 0, delivered: 0, opened: 0, clicked: 0, bounced: 0, failed: 0 }, createdAt: now, updatedAt: now },
      { name: 'Product Launch', subject: 'Introducing Our New Product', templateId: templateIds[2], groupIds: [groupIds[1]], status: 'draft', stats: { total: 0, sent: 0, delivered: 0, opened: 0, clicked: 0, bounced: 0, failed: 0 }, createdAt: now, updatedAt: now },
    ];
    for (const c of campaigns) {
      await addDoc(userCol('campaigns'), c);
    }

    await dbHelpers.setSetting('dataInitialized', true);
    console.log('✅ Sample data initialized in Firestore for user', uid());
  } catch (error) {
    console.error('Error initializing sample data:', error);
  }
}

export default db;
