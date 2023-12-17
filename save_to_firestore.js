require('dotenv').config();

// saveToFirestore.js
const admin = require('firebase-admin');

// Replace 'path/to/your/serviceAccountKey.json' with the actual path to your service account key JSON file
// const serviceAccount = require(process.env.GOOGLE_APPLICATION_CREDENTIALS);
const serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);

// Replace 'your-project-id' with your actual Firebase project ID
const projectId = process.env.PROJECT_ID.projectId;

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${projectId}.firebaseio.com`,
});

// Function to save data to Firestore
async function saveToFirestore(data) {
  try {
    const db = admin.firestore();
    const collection = db.collection('closed_issues');

    // Save each issue to Firestore
    for (const issue of data) {
      const { id, ...issueData } = issue;

      if (id) {
        // Ensure that the id is a non-empty string before using it in the document path
        const documentPath = id.toString(); // Convert id to string if it's not already
        await collection.doc(documentPath).set(issueData);
      } else {
        console.error('Issue does not have a valid "id" property:', issue);
      }
    }

    console.log('Data saved to Firestore successfully.');
  } catch (error) {
    console.error('Error saving data to Firestore:', error.message);
  }
}

module.exports = saveToFirestore;
