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
 * Validate player submissions and compute authoritative score
 * Triggered when a new submission is added to:
 * rooms/{roomId}/players/{playerId}/submissions/{submissionId}
 */
export const validateSubmission = onDocumentCreated(
  "rooms/{roomId}/players/{playerId}/submissions/{submissionId}",
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) return null;

    const data = snapshot.data();
  const { puzzleId, answer, timeSpent } = data as any;
    const roomId = event.params.roomId;
    const playerId = event.params.playerId;

    const db = admin.firestore();

    try {
      // Load canonical challenge data
      const challengeRef = db.collection('challenges').doc(puzzleId);
      const challengeSnap = await challengeRef.get();
      if (!challengeSnap.exists) {
        console.warn('Challenge not found:', puzzleId);
        // mark submission invalid/unknown
        await snapshot.ref.update({ verified: false, reason: 'challenge_not_found' });
        return null;
      }

      const challenge = challengeSnap.data();

      // Basic verification depending on type
      let isCorrect = false;
      const type = (challenge?.type || 'mcq').toString();

      if (type === 'mcq' || type === 'typing' || type === 'emoji') {
        const correctAnswer = (challenge?.correctAnswer || '').toString().trim().toLowerCase();
        if (typeof answer === 'string' && answer.trim().toLowerCase() === correctAnswer) {
          isCorrect = true;
        }
      } else if (type === 'reaction') {
        // For reaction tests shorter timeSpent -> higher score; accept non-empty answer as valid
        isCorrect = typeof timeSpent === 'number' && timeSpent >= 0;
      } else {
        // default check
        isCorrect = (answer || '') !== '';
      }

      // Compute points: use maxScore and apply time-based multiplier
      const maxScore = Number(challenge?.maxScore || 0);
      let pointsAwarded = 0;
      if (isCorrect) {
        // Faster completion -> more points (linear scale)
        const timeLimit = Number(challenge?.timeLimit || 60);
        const speedFactor = Math.max(0.2, (timeLimit - Math.min(timeSpent, timeLimit)) / timeLimit);
        pointsAwarded = Math.round(maxScore * (0.6 + 0.4 * speedFactor));
      }

      // Update the submission doc with verification and points
      await snapshot.ref.update({ verified: true, isCorrect, pointsAwarded, verifiedAt: admin.firestore.FieldValue.serverTimestamp() });

      // Update room player's totalScore and completedChallenges atomically
      const roomPlayerRef = db.collection('rooms').doc(roomId).collection('players').doc(playerId);
      await db.runTransaction(async (tx) => {
        const rpSnap = await tx.get(roomPlayerRef);
        if (!rpSnap.exists) {
          // create minimal player entry
          tx.set(roomPlayerRef, {
            playerId,
            totalScore: pointsAwarded || 0,
            completedChallenges: [puzzleId],
          }, { merge: true });
        } else {
          tx.update(roomPlayerRef, {
            totalScore: admin.firestore.FieldValue.increment(pointsAwarded),
            completedChallenges: admin.firestore.FieldValue.arrayUnion(puzzleId),
          });
        }
      });

      // Update global player stats (players/{playerId}.totalScore)
      const playerRef = db.collection('players').doc(playerId);
      await playerRef.update({ totalScore: admin.firestore.FieldValue.increment(pointsAwarded) });

      // Optionally, update a room leaderboard doc
      const leaderboardRef = db.collection('rooms').doc(roomId).collection('leaderboard').doc(playerId);
      await leaderboardRef.set({ playerId, points: admin.firestore.FieldValue.increment(pointsAwarded), updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });

      console.log(`Submission validated for ${playerId} in room ${roomId}: points ${pointsAwarded}`);
    } catch (err: any) {
      console.error('Error validating submission:', err);
      try {
        await snapshot.ref.update({ verified: false, reason: err.message });
      } catch (e) {
        console.error('Failed to mark submission as invalid:', e);
      }
    }

    return null;
  }
);

/**
 * Example Scheduled Function (runs every day at midnight)
 * Requires Firebase Blaze plan
 */
// import { onSchedule } from "firebase-functions/v2/scheduler";
// export const scheduledFunction = onSchedule("every day 00:00", async (event) => {
//   console.log("This function runs every day at midnight");
//   // Perform your scheduled task here
// });

