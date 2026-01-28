const admin = require('firebase-admin');

// YEH SABSE ZAROORI HAI:
// Firebase credentials ko environment variable se load karein
try {
  const serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);

  // Fix the private key format - replace \\n with actual newlines
  if (serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  console.log('✓ Firebase Admin SDK initialized successfully');

} catch (error) {
  console.error("Firebase Admin SDK initialization failed:", error.message);
  console.error("Please check your FIREBASE_CREDENTIALS in .env file");
}

// Firestore database ka instance export karein
const db = admin.firestore();

module.exports = { db };

