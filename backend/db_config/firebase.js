
// db_config/firebase.js
const admin = require('firebase-admin');
const path = require('path');

// Path to your service account key file
const serviceAccount = require(path.join(__dirname, 'serviceAccountKey.json'));

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: "chefster-e2086.appspot.com", // your storage bucket from Firebase Console
    });
}

const db = admin.firestore();
// const auth = admin.auth();
const storage = admin.storage().bucket(); // Gets the default bucket

module.exports = { admin, db, storage };
