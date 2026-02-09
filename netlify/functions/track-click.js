/**
 * Click Tracking Redirect Endpoint
 * 
 * Records the click event and redirects the user to the original URL.
 * Email links are wrapped to pass through this endpoint.
 */

// Use environment variables from Netlify
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

let firebaseApp = null;
function getFirebaseApp() {
  if (!firebaseApp) {
    const { initializeApp } = require('firebase/app');
    firebaseApp = initializeApp(firebaseConfig, 'tracking-click');
  }
  return firebaseApp;
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-store',
  };

  const url = event.queryStringParameters?.url;
  const tk = event.queryStringParameters?.tk;

  if (!url) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Missing redirect URL' }),
    };
  }

  try {
    if (tk) {
      const decoded = JSON.parse(Buffer.from(tk, 'base64').toString());
      const { c: campaignId, r: recipientId, u: userId } = decoded;

      console.log(`[CLICK] Campaign: ${campaignId}, Recipient: ${recipientId}, User: ${userId || 'unknown'}, URL: ${url}`);

      try {
        const { getFirestore, collection, addDoc, doc, updateDoc, increment } = require('firebase/firestore');
        const app = getFirebaseApp();
        const db = getFirestore(app);

        // 1. Write tracking event to user's trackingEvents subcollection
        const colRef = userId
          ? collection(doc(db, 'users', userId), 'trackingEvents')
          : collection(db, 'trackingEvents');

        await addDoc(colRef, {
          type: 'click',
          campaignId: String(campaignId),
          recipientId: String(recipientId),
          url: decodeURIComponent(url),
          timestamp: new Date().toISOString(),
          userAgent: event.headers['user-agent'] || '',
          ip: event.headers['x-forwarded-for'] || event.headers['client-ip'] || '',
        });

        // 2. Increment campaign.stats.clicked in Firestore
        if (userId && campaignId) {
          try {
            const campaignRef = doc(db, 'users', userId, 'campaigns', String(campaignId));
            await updateDoc(campaignRef, {
              'stats.clicked': increment(1),
            });
            console.log(`[CLICK] Incremented stats.clicked for campaign ${campaignId}`);
          } catch (statsErr) {
            console.error('Failed to update campaign stats (non-blocking):', statsErr.message);
          }
        }
      } catch (firestoreErr) {
        console.error('Firestore write error (non-blocking):', firestoreErr.message);
      }
    }
  } catch (err) {
    console.error('Click tracking error:', err.message);
  }

  // Always redirect to the original URL
  return {
    statusCode: 302,
    headers: {
      ...headers,
      Location: decodeURIComponent(url),
    },
    body: '',
  };
};
