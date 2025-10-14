'use client';

import { Card, CardContent, Typography, Button, Box } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

interface RoomCardProps {
  title: string;
  description: string;
  icon: string;
  gradient: string;
  buttonText: string;
  onClick: () => void;
}

export default function RoomCard({
  title,
  description,
  icon,
  gradient,
  buttonText,
  onClick,
}: RoomCardProps) {
  return (
    <Card
      elevation={0}
      className="h-full transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 cursor-pointer group"
      sx={{
        borderRadius: 4,
        border: '1px solid',
        borderColor: 'rgba(0,0,0,0.06)',
        overflow: 'hidden',
      }}
      onClick={onClick}
    >
      {/* Gradient Header */}
      <Box className={`bg-gradient-to-r ${gradient} p-6 sm:p-8 text-white relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
        
        <Typography
          variant="h2"
          className="mb-3 relative z-10"
          sx={{ fontSize: { xs: '2.5rem', sm: '3rem' } }}
        >
          {icon}
        </Typography>
        <Typography
          variant="h5"
          className="font-bold relative z-10"
          sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
        >
          {title}
        </Typography>
      </Box>

      {/* Card Content */}
      <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
        <Typography
          variant="body1"
          className="text-gray-600 mb-6"
          sx={{ fontSize: { xs: '0.9rem', sm: '1rem' }, minHeight: { sm: '48px' } }}
        >
          {description}
        </Typography>

        <Button
          variant="contained"
          fullWidth
          size="large"
          endIcon={<ArrowForwardIcon />}
          className="group-hover:shadow-lg transition-all duration-300"
          sx={{
            background: `linear-gradient(to right, ${gradient.includes('indigo') ? '#6366f1, #9333ea' : '#ec4899, #f43f5e'})`,
            py: { xs: 1.5, sm: 1.75 },
            fontSize: { xs: '0.95rem', sm: '1rem' },
            '&:hover': {
              transform: 'scale(1.02)',
            },
          }}
        >
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
}
