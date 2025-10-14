'use client';

import { Card, CardContent, Typography, Box } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PsychologyIcon from '@mui/icons-material/Psychology';
import SpeedIcon from '@mui/icons-material/Speed';
import KeyboardIcon from '@mui/icons-material/Keyboard';

export default function GameStats() {
  const puzzles = [
    {
      icon: <PsychologyIcon sx={{ fontSize: 32 }} />,
      name: 'MCQ Trivia',
      color: 'from-blue-500 to-cyan-500',
      description: 'Test your knowledge',
    },
    {
      icon: <EmojiEventsIcon sx={{ fontSize: 32 }} />,
      name: 'Emoji Puzzle',
      color: 'from-yellow-500 to-orange-500',
      description: 'Decode the emojis',
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 32 }} />,
      name: 'Reaction Test',
      color: 'from-green-500 to-emerald-500',
      description: 'Lightning fast reflexes',
    },
    {
      icon: <KeyboardIcon sx={{ fontSize: 32 }} />,
      name: 'Typing Sprint',
      color: 'from-purple-500 to-pink-500',
      description: 'Type at light speed',
    },
  ];

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'rgba(0,0,0,0.06)',
      }}
    >
      <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
        <Typography variant="h6" className="font-bold text-gray-800 mb-4">
          Game Challenges
        </Typography>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {puzzles.map((puzzle, index) => (
            <Box
              key={index}
              className={`bg-gradient-to-r ${puzzle.color} rounded-2xl p-4 text-white transition-transform hover:scale-105 cursor-pointer`}
            >
              <div className="flex items-start gap-3">
                <div className="bg-white/20 rounded-xl p-2">{puzzle.icon}</div>
                <div className="flex-1">
                  <Typography variant="subtitle1" className="font-bold mb-1">
                    {puzzle.name}
                  </Typography>
                  <Typography variant="caption" className="opacity-90">
                    {puzzle.description}
                  </Typography>
                </div>
              </div>
            </Box>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
