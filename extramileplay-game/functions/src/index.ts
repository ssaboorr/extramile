import { onRequest } from "firebase-functions/v2/https";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";

// Initialize Firebase Admin
// The emulator will automatically configure this when running locally
if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Example HTTP Cloud Function
 * Callable via HTTPS endpoint
 */
export const helloWorld = onRequest((request, response) => {
  response.json({ message: "Hello from Firebase Cloud Functions!" });
});

/**
 * Example Callable Cloud Function
 * Can be called directly from your app using the Firebase SDK
 */
export const addMessage = onRequest(async (request, response) => {
  try {
    console.log("Request body:", request.body);
    const text = request.body.text;
    
    if (!text) {
      response.status(400).json({ error: "Text is required" });
      return;
    }

    console.log("Adding message to Firestore:", text);
    
    // Get Firestore instance
    const db = admin.firestore();
    
    // Add a new document to Firestore
    const writeResult = await db
      .collection("messages")
      .add({ 
        text, 
        timestamp: admin.firestore.Timestamp.now(),
        createdAt: new Date().toISOString()
      });

    console.log("Message added successfully with ID:", writeResult.id);

    response.json({ 
      success: true,
      message: "Message added successfully",
      id: writeResult.id 
    });
  } catch (error: any) {
    console.error("Error adding message:", error);
    console.error("Error details:", error.message, error.stack);
    response.status(500).json({ 
      error: "Internal server error",
      details: error.message 
    });
  }
});

/**
 * Example Firestore Trigger
 * Automatically runs when a new document is created in the 'messages' collection
 */
export const onMessageCreated = onDocumentCreated("messages/{messageId}", (event) => {
  const snapshot = event.data;
  
  if (!snapshot) {
    console.log("No data associated with the event");
    return;
  }

  const data = snapshot.data();
  console.log(`New message created: ${data.text}`);
  
  // You can perform additional operations here
  // For example, send a notification, update another collection, etc.
  
  return null;
});

/**
 * Example Scheduled Function (runs every day at midnight)
 * Requires Firebase Blaze plan
 */
// import { onSchedule } from "firebase-functions/v2/scheduler";
// export const scheduledFunction = onSchedule("every day 00:00", async (event) => {
//   console.log("This function runs every day at midnight");
//   // Perform your scheduled task here
// });

