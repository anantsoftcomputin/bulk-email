/**
 * Open Tracking Pixel Endpoint
 * 
 * Returns a 1x1 transparent GIF and records the open event.
 * Called automatically when an email client loads the tracking pixel image.
 */

// 1x1 transparent GIF in base64
const TRANSPARENT_GIF = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
);

const firebaseConfig = {
  apiKey: "AIzaSyB9spE_tHCa-Ph96DDnYxQX_7GzHSbGBGQ",
  authDomain: "mados-7cc5b.firebaseapp.com",
  projectId: "mados-7cc5b",
  storageBucket: "mados-7cc5b.firebasestorage.app",
  messagingSenderId: "969407470784",
  appId: "1:969407470784:web:894637ccb2066f7677a125",
};

let firebaseApp = null;
function getFirebaseApp() {
  if (!firebaseApp) {
    const { initializeApp } = require('firebase/app');
    firebaseApp = initializeApp(firebaseConfig, 'tracking-open');
  }
  return firebaseApp;
}

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'image/gif',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Access-Control-Allow-Origin': '*',
  };

  try {
    const tk = event.queryStringParameters?.tk;
    if (tk) {
      const decoded = JSON.parse(Buffer.from(tk, 'base64').toString());
      const { c: campaignId, r: recipientId, u: userId } = decoded;

      console.log(`[OPEN] Campaign: ${campaignId}, Recipient: ${recipientId}, User: ${userId || 'unknown'}, UA: ${event.headers['user-agent'] || 'unknown'}`);

      try {
        const { getFirestore, collection, addDoc, doc, updateDoc, increment } = require('firebase/firestore');
        const app = getFirebaseApp();
        const db = getFirestore(app);

        // 1. Write tracking event to user's trackingEvents subcollection
        const colRef = userId
          ? collection(doc(db, 'users', userId), 'trackingEvents')
          : collection(db, 'trackingEvents');

        await addDoc(colRef, {
          type: 'open',
          campaignId: String(campaignId),
          recipientId: String(recipientId),
          timestamp: new Date().toISOString(),
          userAgent: event.headers['user-agent'] || '',
          ip: event.headers['x-forwarded-for'] || event.headers['client-ip'] || '',
        });

        // 2. Increment campaign.stats.opened in Firestore
        if (userId && campaignId) {
          try {
            const campaignRef = doc(db, 'users', userId, 'campaigns', String(campaignId));
            await updateDoc(campaignRef, {
              'stats.opened': increment(1),
            });
            console.log(`[OPEN] Incremented stats.opened for campaign ${campaignId}`);
          } catch (statsErr) {
            console.error('Failed to update campaign stats (non-blocking):', statsErr.message);
          }
        }
      } catch (firestoreErr) {
        console.error('Firestore write error (non-blocking):', firestoreErr.message);
      }
    }
  } catch (err) {
    console.error('Tracking error:', err.message);
  }

  // Always return the pixel, even on errors
  return {
    statusCode: 200,
    headers,
    body: TRANSPARENT_GIF.toString('base64'),
    isBase64Encoded: true,
  };
};
