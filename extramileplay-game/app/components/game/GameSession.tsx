'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  useTheme,
  Fade,
} from '@mui/material';
import GamePuzzle from './GamePuzzle';

interface Puzzle {
  id: string;
  type: 'mcq' | 'text' | 'number';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  points: number;
  timeLimit: number;
}

interface GameSessionProps {
  roomId: string;
  playerId: string;
  onGameComplete: (results: GameResults) => void;
}

interface GameResults {
  score: number;
  accuracy: number;
  timeSpent: number;
  puzzlesCompleted: number;
  answers: Array<{
    puzzleId: string;
    answer: string;
    isCorrect: boolean;
    timeSpent: number;
  }>;
}

const SAMPLE_PUZZLES: Puzzle[] = [
  {
    id: '1',
    type: 'mcq',
    question: 'What is the capital of France?',
    options: ['London', 'Berlin', 'Paris', 'Madrid'],
    correctAnswer: 'Paris',
    explanation: 'Paris has been the capital of France since the 12th century.',
    points: 10,
    timeLimit: 30,
  },
  {
    id: '2',
    type: 'text',
    question: 'What is the largest planet in our solar system?',
    correctAnswer: 'Jupiter',
    explanation: 'Jupiter is the largest planet in our solar system.',
    points: 20,
    timeLimit: 45,
  },
  {
    id: '3',
    type: 'number',
    question: 'What is 15 × 8?',
    correctAnswer: '120',
    explanation: '15 multiplied by 8 equals 120.',
    points: 15,
    timeLimit: 20,
  },
  {
    id: '4',
    type: 'mcq',
    question: 'Which programming language is known for its use in web development?',
    options: ['Python', 'JavaScript', 'C++', 'Java'],
    correctAnswer: 'JavaScript',
    explanation: 'JavaScript is primarily used for web development, especially frontend.',
    points: 25,
    timeLimit: 40,
  },
];

export default function GameSession({ roomId, playerId, onGameComplete }: GameSessionProps) {
  const theme = useTheme();
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [answers, setAnswers] = useState<GameResults['answers']>([]);
  const [gameStartTime] = useState(Date.now());
  const [puzzleStartTime, setPuzzleStartTime] = useState(Date.now());
  const [isGameActive, setIsGameActive] = useState(true);

  const currentPuzzle = SAMPLE_PUZZLES[currentPuzzleIndex];
  const totalPuzzles = SAMPLE_PUZZLES.length;
  const progress = ((currentPuzzleIndex + 1) / totalPuzzles) * 100;

  const handleAnswer = (answer: string, timeSpent: number) => {
    const isCorrect = answer.toLowerCase().trim() === currentPuzzle.correctAnswer.toLowerCase().trim();
    
    const newAnswer = {
      puzzleId: currentPuzzle.id,
      answer,
      isCorrect,
      timeSpent,
    };

    setAnswers(prev => [...prev, newAnswer]);

    // Move to next puzzle or end game
    setTimeout(() => {
      if (currentPuzzleIndex < totalPuzzles - 1) {
        setCurrentPuzzleIndex(prev => prev + 1);
        setPuzzleStartTime(Date.now());
      } else {
        endGame();
      }
    }, 2000);
  };

  const handleSkip = () => {
    const timeSpent = Math.floor((Date.now() - puzzleStartTime) / 1000);
    
    const newAnswer = {
      puzzleId: currentPuzzle.id,
      answer: '',
      isCorrect: false,
      timeSpent,
    };

    setAnswers(prev => [...prev, newAnswer]);

    // Move to next puzzle or end game
    if (currentPuzzleIndex < totalPuzzles - 1) {
      setCurrentPuzzleIndex(prev => prev + 1);
      setPuzzleStartTime(Date.now());
    } else {
      endGame();
    }
  };

  const endGame = () => {
    setIsGameActive(false);
    
    const totalTime = Math.floor((Date.now() - gameStartTime) / 1000);
    const correctAnswers = answers.filter(a => a.isCorrect).length;
    const score = answers.reduce((total, answer) => {
      return total + (answer.isCorrect ? currentPuzzle.points : 0);
    }, 0);
    const accuracy = answers.length > 0 ? (correctAnswers / answers.length) * 100 : 0;

    const results: GameResults = {
      score,
      accuracy,
      timeSpent: totalTime,
      puzzlesCompleted: answers.length,
      answers,
    };

    onGameComplete(results);
  };

  // Auto-skip if time limit exceeded
  useEffect(() => {
    if (!isGameActive || !currentPuzzle) return;

    const timer = setTimeout(() => {
      handleSkip();
    }, currentPuzzle.timeLimit * 1000);

    return () => clearTimeout(timer);
  }, [currentPuzzleIndex, isGameActive]);

  if (!isGameActive || !currentPuzzle) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography
          variant="h4"
          sx={{
            color: 'white',
            fontWeight: 700,
            mb: 2,
          }}
        >
          Game Completed!
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: 'rgba(255, 255, 255, 0.8)',
          }}
        >
          Processing your results...
        </Typography>
      </Box>
    );
  }

  return (
    <Fade in timeout={500} key={currentPuzzleIndex}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Game Progress */}
        <Box
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: theme.shape.borderRadius,
            p: 3,
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography
              variant="h6"
              sx={{
                color: 'white',
                fontWeight: 600,
              }}
            >
              Question {currentPuzzleIndex + 1} of {totalPuzzles}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
              }}
            >
              {Math.round(progress)}% Complete
            </Typography>
          </Box>
          
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: theme.palette.primary.main,
              },
            }}
          />
        </Box>

        {/* Current Puzzle */}
        <GamePuzzle
          puzzle={currentPuzzle}
          onAnswer={handleAnswer}
          onSkip={handleSkip}
        />
      </Box>
    </Fade>
  );
}
