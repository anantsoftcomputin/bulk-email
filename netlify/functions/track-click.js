/**
 * Click Tracking Redirect Endpoint
 * 
 * Records the click event and redirects the user to the original URL.
 * Email links are wrapped to pass through this endpoint.
 */

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
      const { c: campaignId, r: recipientId } = decoded;

      console.log(`[CLICK] Campaign: ${campaignId}, Recipient: ${recipientId}, URL: ${url}`);

      // Fire-and-forget: Write tracking event to Firestore
      try {
        const { initializeApp } = require('firebase/app');
        const { getFirestore, collection, addDoc } = require('firebase/firestore');
        
        const app = initializeApp({
          apiKey: "AIzaSyB9spE_tHCa-Ph96DDnYxQX_7GzHSbGBGQ",
          authDomain: "mados-7cc5b.firebaseapp.com",
          projectId: "mados-7cc5b",
          storageBucket: "mados-7cc5b.firebasestorage.app",
          messagingSenderId: "969407470784",
          appId: "1:969407470784:web:894637ccb2066f7677a125",
        }, 'tracking-click');
        
        const db = getFirestore(app);
        
        await addDoc(collection(db, 'trackingEvents'), {
          type: 'click',
          campaignId: Number(campaignId),
          recipientId: Number(recipientId),
          url: decodeURIComponent(url),
          timestamp: new Date().toISOString(),
          userAgent: event.headers['user-agent'] || '',
          ip: event.headers['x-forwarded-for'] || event.headers['client-ip'] || '',
        });
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
