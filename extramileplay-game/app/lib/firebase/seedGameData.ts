import {
  collection,
  doc,
  setDoc,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';
import { gameQuestions, gameSessionVariants } from './gameQuestions';

export const seedGameQuestions = async (): Promise<void> => {
  console.log('🎮 Seeding game questions...');

  try {
    const batch = writeBatch(db);

    // Add all questions to challenges collection
    gameQuestions.forEach((challenge) => {
      const challengeRef = doc(db, 'challenges', challenge.challengeId);
      batch.set(challengeRef, {
        ...challenge,
        createdAt: serverTimestamp(),
        isActive: true,
      });
    });

    await batch.commit();

    // Create game session templates
    await createGameSessionTemplates();

    console.log(`✅ Seeded ${gameQuestions.length} game questions successfully!`);
  } catch (error) {
    console.error('❌ Error seeding game questions:', error);
    throw error;
  }
};

const createGameSessionTemplates = async (): Promise<void> => {
  console.log('📋 Creating game session templates...');

  const templates = gameSessionVariants.map((session, index) => ({
    templateId: `session-${index + 1}`,
    name: `Game Session ${index + 1}`,
    difficulty: index === 0 ? 'easy' : index === 1 ? 'medium' : 'hard',
    challenges: session.map((challenge) => challenge.challengeId),
    totalTime: session.reduce((sum, challenge) => sum + challenge.timeLimit, 0),
    maxScore: session.reduce((sum, challenge) => sum + challenge.maxScore, 0),
    createdAt: serverTimestamp(),
  }));

  const batch = writeBatch(db);

  templates.forEach((template) => {
    const templateRef = doc(db, 'gameTemplates', template.templateId);
    batch.set(templateRef, template);
  });

  await batch.commit();
  console.log('✅ Game session templates created');
};

// Function to get questions for a game room
export const assignQuestionsToRoom = async (roomId: string): Promise<void> => {
  console.log(`🎯 Assigning questions to room: ${roomId}`);

  // Get a random game session
  const sessionIndex = Math.floor(Math.random() * gameSessionVariants.length);
  const selectedSession = gameSessionVariants[sessionIndex];

  const batch = writeBatch(db);

  selectedSession.forEach((challenge, index) => {
    const roomChallengeRef = doc(db, 'rooms', roomId, 'challenges', challenge.challengeId);
    batch.set(roomChallengeRef, {
      ...challenge,
      roomId,
      playOrder: index + 1,
      assignedAt: serverTimestamp(),
      isCompleted: false,
    });
  });

  await batch.commit();
  console.log(`✅ Assigned ${selectedSession.length} challenges to room ${roomId}`);
};
