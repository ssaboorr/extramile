#!/usr/bin/env node
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Default order: CLI arg -> GOOGLE_APPLICATION_CREDENTIALS env -> ./service_account.json
const svcPath = process.argv[2] || process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(process.cwd(), 'service_account.json');


if (!fs.existsSync(svcPath)) {
  console.error('Service account file not found at', svcPath);
  process.exit(1);
}

const serviceAccount = require(path.resolve(svcPath));

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

const db = admin.firestore();

const data = require('../app/lib/firebase/gameQuestions.json');
const gameQuestions = data.gameQuestions;
const gameSessionVariants = data.gameSessionVariants;

async function seed() {
  try {
    console.log('Seeding challenges...');
    const batch = db.batch();
    gameQuestions.forEach((q) => {
      const ref = db.collection('challenges').doc(q.challengeId);
      batch.set(ref, { ...q, createdAt: admin.firestore.FieldValue.serverTimestamp(), isActive: true });
    });
    await batch.commit();
    console.log('Challenges seeded:', gameQuestions.length);

    console.log('Seeding game templates...');
    const tmplBatch = db.batch();
    gameSessionVariants.forEach((session, idx) => {
      const templateId = `session-${idx + 1}`;
      const ref = db.collection('gameTemplates').doc(templateId);
      const template = {
        templateId,
        name: `Game Session ${idx + 1}`,
        difficulty: idx === 0 ? 'easy' : idx === 1 ? 'medium' : 'hard',
        challenges: session,
        totalTime: session.reduce((sum, id) => {
          const q = gameQuestions.find(x => x.challengeId === id);
          return sum + (q ? q.timeLimit : 0);
        }, 0),
        maxScore: session.reduce((sum, id) => {
          const q = gameQuestions.find(x => x.challengeId === id);
          return sum + (q ? q.maxScore : 0);
        }, 0),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };
      tmplBatch.set(ref, template);
    });
    await tmplBatch.commit();
    console.log('Game templates seeded');

    console.log('✅ Seeding finished');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error', err);
    process.exit(1);
  }
}

seed();
