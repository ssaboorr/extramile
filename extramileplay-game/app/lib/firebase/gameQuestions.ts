export interface Challenge {
  challengeId: string;
  type: 'mcq' | 'emoji' | 'reaction' | 'typing';
  order: number;
  question: string;
  options?: string[];
  correctAnswer: string;
  emojis?: string;
  targetText?: string;
  maxScore: number;
  timeLimit: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category?: string;
}

export const gameQuestions: Challenge[] = [
  // ========== MCQ TRIVIA QUESTIONS (5 Questions) ==========
  {
    challengeId: 'mcq-001',
    type: 'mcq',
    order: 1,
    question: 'Which planet is known as the "Red Planet"?',
    options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
    correctAnswer: 'Mars',
    maxScore: 100,
    timeLimit: 30,
    difficulty: 'easy',
    category: 'Science'
  },
  {
    challengeId: 'mcq-002',
    type: 'mcq',
    order: 1,
    question: 'Who painted the famous artwork "The Starry Night"?',
    options: ['Pablo Picasso', 'Leonardo da Vinci', 'Vincent van Gogh', 'Claude Monet'],
    correctAnswer: 'Vincent van Gogh',
    maxScore: 100,
    timeLimit: 30,
    difficulty: 'medium',
    category: 'Art'
  },
  {
    challengeId: 'mcq-003',
    type: 'mcq',
    order: 1,
    question: 'What is the capital city of Australia?',
    options: ['Sydney', 'Melbourne', 'Brisbane', 'Canberra'],
    correctAnswer: 'Canberra',
    maxScore: 100,
    timeLimit: 30,
    difficulty: 'medium',
    category: 'Geography'
  },
  {
    challengeId: 'mcq-004',
    type: 'mcq',
    order: 1,
    question: 'Which element has the chemical symbol "Au"?',
    options: ['Silver', 'Gold', 'Aluminum', 'Argon'],
    correctAnswer: 'Gold',
    maxScore: 100,
    timeLimit: 30,
    difficulty: 'medium',
    category: 'Chemistry'
  },
  {
    challengeId: 'mcq-005',
    type: 'mcq',
    order: 1,
    question: 'In which year did World War II end?',
    options: ['1944', '1945', '1946', '1947'],
    correctAnswer: '1945',
    maxScore: 100,
    timeLimit: 30,
    difficulty: 'easy',
    category: 'History'
  },

  // ========== EMOJI PUZZLE QUESTIONS ==========
  {
    challengeId: 'emoji-001',
    type: 'emoji',
    order: 2,
    question: 'Guess the movie from these emojis:',
    emojis: '🦁👑',
    correctAnswer: 'The Lion King',
    maxScore: 100,
    timeLimit: 45,
    difficulty: 'easy',
    category: 'Movies'
  },
  {
    challengeId: 'emoji-002',
    type: 'emoji',
    order: 2,
    question: 'What famous landmark is represented by these emojis?',
    emojis: '🗽🇺🇸',
    correctAnswer: 'Statue of Liberty',
    maxScore: 100,
    timeLimit: 45,
    difficulty: 'easy',
    category: 'Landmarks'
  },
  {
    challengeId: 'emoji-003',
    type: 'emoji',
    order: 2,
    question: 'Guess the food dish from these emojis:',
    emojis: '🍕🇮🇹',
    correctAnswer: 'Pizza',
    maxScore: 100,
    timeLimit: 45,
    difficulty: 'easy',
    category: 'Food'
  },
  {
    challengeId: 'emoji-004',
    type: 'emoji',
    order: 2,
    question: 'What sport is represented by these emojis?',
    emojis: '⚽🥅',
    correctAnswer: 'Soccer',
    maxScore: 100,
    timeLimit: 45,
    difficulty: 'easy',
    category: 'Sports'
  },
  {
    challengeId: 'emoji-005',
    type: 'emoji',
    order: 2,
    question: 'Guess the animal from these emojis:',
    emojis: '🐘🥜',
    correctAnswer: 'Elephant',
    maxScore: 100,
    timeLimit: 45,
    difficulty: 'medium',
    category: 'Animals'
  },

  // ========== REACTION TEST QUESTIONS ==========
  {
    challengeId: 'reaction-001',
    type: 'reaction',
    order: 3,
    question: 'Click the button as soon as it turns GREEN! Get ready...',
    correctAnswer: 'reaction_time',
    maxScore: 100,
    timeLimit: 10,
    difficulty: 'medium',
    category: 'Reflexes'
  },
  {
    challengeId: 'reaction-002',
    type: 'reaction',
    order: 3,
    question: 'Lightning reflexes test! Click when you see GREEN!',
    correctAnswer: 'reaction_time',
    maxScore: 100,
    timeLimit: 10,
    difficulty: 'medium',
    category: 'Reflexes'
  },
  {
    challengeId: 'reaction-003',
    type: 'reaction',
    order: 3,
    question: 'Speed challenge! Tap the button the moment it changes to GREEN!',
    correctAnswer: 'reaction_time',
    maxScore: 100,
    timeLimit: 10,
    difficulty: 'hard',
    category: 'Reflexes'
  },

  // ========== TYPING SPRINT QUESTIONS ==========
  {
    challengeId: 'typing-001',
    type: 'typing',
    order: 4,
    question: 'Type the following sentence exactly as shown:',
    targetText: 'The quick brown fox jumps over the lazy dog',
    correctAnswer: 'The quick brown fox jumps over the lazy dog',
    maxScore: 100,
    timeLimit: 60,
    difficulty: 'easy',
    category: 'Typing'
  },
  {
    challengeId: 'typing-002',
    type: 'typing',
    order: 4,
    question: 'Type this programming quote accurately:',
    targetText: 'Code is like humor. When you have to explain it, it\'s bad.',
    correctAnswer: 'Code is like humor. When you have to explain it, it\'s bad.',
    maxScore: 100,
    timeLimit: 45,
    difficulty: 'medium',
    category: 'Programming'
  },
  {
    challengeId: 'typing-003',
    type: 'typing',
    order: 4,
    question: 'Speed typing challenge - type exactly:',
    targetText: 'JavaScript is the language of the web and beyond',
    correctAnswer: 'JavaScript is the language of the web and beyond',
    maxScore: 100,
    timeLimit: 40,
    difficulty: 'medium',
    category: 'Technology'
  },
  {
    challengeId: 'typing-004',
    type: 'typing',
    order: 4,
    question: 'Type this tongue twister perfectly:',
    targetText: 'She sells seashells by the seashore',
    correctAnswer: 'She sells seashells by the seashore',
    maxScore: 100,
    timeLimit: 35,
    difficulty: 'hard',
    category: 'Language'
  }
];

// Game session configuration (4 puzzles in order)
export const gameSession: Challenge[] = [
  // Random MCQ question
  gameQuestions.find(q => q.challengeId === 'mcq-003')!, // Geography
  
  // Random Emoji puzzle
  gameQuestions.find(q => q.challengeId === 'emoji-001')!, // Lion King
  
  // Reaction test
  gameQuestions.find(q => q.challengeId === 'reaction-001')!, // Basic reaction
  
  // Typing sprint
  gameQuestions.find(q => q.challengeId === 'typing-001')! // Quick brown fox
];

// Alternative game sessions for variety
export const gameSessionVariants: Challenge[][] = [
  // Session 1 - Easy
  [
    gameQuestions.find(q => q.challengeId === 'mcq-001')!, // Mars
    gameQuestions.find(q => q.challengeId === 'emoji-003')!, // Pizza
    gameQuestions.find(q => q.challengeId === 'reaction-001')!, // Basic reaction
    gameQuestions.find(q => q.challengeId === 'typing-001')! // Quick brown fox
  ],
  
  // Session 2 - Medium
  [
    gameQuestions.find(q => q.challengeId === 'mcq-004')!, // Chemistry
    gameQuestions.find(q => q.challengeId === 'emoji-002')!, // Statue of Liberty
    gameQuestions.find(q => q.challengeId === 'reaction-002')!, // Lightning reflexes
    gameQuestions.find(q => q.challengeId === 'typing-002')! // Programming quote
  ],
  
  // Session 3 - Hard
  [
    gameQuestions.find(q => q.challengeId === 'mcq-003')!, // Australia capital
    gameQuestions.find(q => q.challengeId === 'emoji-005')!, // Elephant
    gameQuestions.find(q => q.challengeId === 'reaction-003')!, // Speed challenge
    gameQuestions.find(q => q.challengeId === 'typing-004')! // Tongue twister
  ]
];

// Helper functions
export const getRandomGameSession = (): Challenge[] => {
  const randomIndex = Math.floor(Math.random() * gameSessionVariants.length);
  return gameSessionVariants[randomIndex];
};

export const getMCQQuestions = (): Challenge[] => {
  return gameQuestions.filter(q => q.type === 'mcq');
};

export const getEmojiQuestions = (): Challenge[] => {
  return gameQuestions.filter(q => q.type === 'emoji');
};

export const getRandomMCQ = (): Challenge => {
  const mcqQuestions = getMCQQuestions();
  const randomIndex = Math.floor(Math.random() * mcqQuestions.length);
  return mcqQuestions[randomIndex];
};
