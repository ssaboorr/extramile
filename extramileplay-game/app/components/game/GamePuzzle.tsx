'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  useTheme,
  Fade,
  Chip,
} from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';
import GlassCard from '@/components/shared/GlassCard';
import GlassButton from '@/components/shared/GlassButton';

interface Puzzle {
  id: string;
  type: 'mcq' | 'text' | 'number';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  points: number;
  timeLimit: number; // in seconds
}

interface GamePuzzleProps {
  puzzle: Puzzle;
  onAnswer: (answer: string, timeSpent: number) => void;
  onSkip: () => void;
  disabled?: boolean;
}

export default function GamePuzzle({ puzzle, onAnswer, onSkip, disabled = false }: GamePuzzleProps) {
  const theme = useTheme();
  const [answer, setAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [startTime] = useState(Date.now());

  const handleSubmit = () => {
    const finalAnswer = puzzle.type === 'mcq' ? selectedOption : answer;
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    
    const correct = finalAnswer.toLowerCase().trim() === puzzle.correctAnswer.toLowerCase().trim();
    setIsCorrect(correct);
    setShowResult(true);
    
    // Call the answer handler after a brief delay to show the result
    setTimeout(() => {
      onAnswer(finalAnswer, timeSpent);
    }, 2000);
  };

  const handleSkip = () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    onSkip();
  };

  const getPuzzleIcon = () => {
    switch (puzzle.type) {
      case 'mcq': return '📝';
      case 'text': return '✍️';
      case 'number': return '🔢';
      default: return '❓';
    }
  };

  const getDifficultyColor = () => {
    switch (puzzle.points) {
      case 10: return '#4caf50'; // Easy
      case 20: return '#ff9800'; // Medium
      case 30: return '#f44336'; // Hard
      default: return theme.palette.grey[500];
    }
  };

  return (
    <Fade in timeout={500}>
      <GlassCard hover={false}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          {/* Puzzle Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h4">{getPuzzleIcon()}</Typography>
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    color: 'white',
                    fontWeight: 700,
                    mb: 0.5,
                  }}
                >
                  {puzzle.type.toUpperCase()} Question
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    label={`${puzzle.points} Points`}
                    size="small"
                    sx={{
                      backgroundColor: getDifficultyColor(),
                      color: 'white',
                      fontWeight: 600,
                    }}
                  />
                  <Chip
                    label={`${puzzle.timeLimit}s`}
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      color: 'white',
                      fontWeight: 600,
                    }}
                  />
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Question */}
          <Typography
            variant="h5"
            sx={{
              color: 'white',
              fontWeight: 600,
              mb: 4,
              lineHeight: 1.4,
              textAlign: 'center',
            }}
          >
            {puzzle.question}
          </Typography>

          {/* Answer Section */}
          {!showResult ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {puzzle.type === 'mcq' && puzzle.options ? (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                    gap: 2,
                  }}
                >
                  {puzzle.options.map((option, index) => (
                    <Button
                      key={index}
                      variant={selectedOption === option ? 'contained' : 'outlined'}
                      onClick={() => setSelectedOption(option)}
                      disabled={disabled}
                      sx={{
                        p: 2,
                        textAlign: 'left',
                        justifyContent: 'flex-start',
                        backgroundColor: selectedOption === option ? theme.palette.primary.main : 'rgba(255, 255, 255, 0.05)',
                        border: `1px solid ${selectedOption === option ? theme.palette.primary.main : 'rgba(255, 255, 255, 0.2)'}`,
                        color: 'white',
                        '&:hover': {
                          backgroundColor: selectedOption === option ? theme.palette.primary.dark : 'rgba(255, 255, 255, 0.1)',
                        },
                      }}
                    >
                      <Typography sx={{ fontWeight: 600 }}>
                        {String.fromCharCode(65 + index)}. {option}
                      </Typography>
                    </Button>
                  ))}
                </Box>
              ) : (
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder={puzzle.type === 'number' ? 'Enter a number' : 'Type your answer'}
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  disabled={disabled}
                  type={puzzle.type === 'number' ? 'number' : 'text'}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      color: 'white',
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: theme.palette.primary.light,
                      },
                    },
                    '& .MuiInputBase-input': {
                      color: 'white',
                      '&::placeholder': {
                        color: 'rgba(255, 255, 255, 0.7)',
                      },
                    },
                  }}
                />
              )}

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <GlassButton
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={
                    disabled ||
                    (puzzle.type === 'mcq' ? !selectedOption : !answer.trim()) ||
                    showResult
                  }
                  sx={{ minWidth: 120 }}
                >
                  Submit Answer
                </GlassButton>
                
                <GlassButton
                  variant="outlined"
                  onClick={handleSkip}
                  disabled={disabled || showResult}
                  sx={{ minWidth: 120 }}
                >
                  Skip
                </GlassButton>
              </Box>
            </Box>
          ) : (
            /* Result Display */
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                {isCorrect ? (
                  <CheckCircle sx={{ fontSize: 64, color: '#4caf50' }} />
                ) : (
                  <Cancel sx={{ fontSize: 64, color: '#f44336' }} />
                )}
              </Box>
              
              <Typography
                variant="h4"
                sx={{
                  color: isCorrect ? '#4caf50' : '#f44336',
                  fontWeight: 700,
                  mb: 2,
                }}
              >
                {isCorrect ? 'Correct!' : 'Incorrect'}
              </Typography>
              
              {!isCorrect && (
                <Typography
                  variant="body1"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    mb: 2,
                  }}
                >
                  Correct answer: <strong>{puzzle.correctAnswer}</strong>
                </Typography>
              )}
              
              {puzzle.explanation && (
                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontStyle: 'italic',
                  }}
                >
                  {puzzle.explanation}
                </Typography>
              )}
            </Box>
          )}
        </CardContent>
      </GlassCard>
    </Fade>
  );
}
