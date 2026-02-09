// Netlify Function: Capture landing page enquiries into Firestore
const { initializeApp, getApps } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: 'AIzaSyB9spE_tHCa-Ph96DDnYxQX_7GzHSbGBGQ',
  authDomain: 'mados-7cc5b.firebaseapp.com',
  projectId: 'mados-7cc5b',
  storageBucket: 'mados-7cc5b.firebasestorage.app',
  messagingSenderId: '969407470784',
  appId: '1:969407470784:web:894637ccb2066f7677a125',
  measurementId: 'G-L2662CPKGB',
};

let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}
const db = getFirestore(app);

exports.handler = async (event) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const data = JSON.parse(event.body);

    // Basic validation
    if (!data.name || !data.email || !data.message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Name, email, and message are required.' }),
      };
    }

    // Save to top-level "enquiries" collection (not per-user)
    const docRef = await addDoc(collection(db, 'enquiries'), {
      name: data.name,
      email: data.email,
      company: data.company || '',
      message: data.message,
      submittedAt: data.submittedAt || new Date().toISOString(),
      createdAt: serverTimestamp(),
      status: 'new',
      source: 'landing-page',
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, id: docRef.id }),
    };
  } catch (err) {
    console.error('Enquiry submit error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
