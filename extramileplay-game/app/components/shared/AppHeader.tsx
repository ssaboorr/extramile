'use client';

import { 
  Box, 
  Container, 
  Typography, 
  Avatar, 
  IconButton, 
  Tooltip,
  Paper,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { User } from 'firebase/auth';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import LogoutIcon from '@mui/icons-material/Logout';

interface AppHeaderProps {
  user: User | null;
  onLogout: () => void;
  title?: string;
  subtitle?: string;
}

export default function AppHeader({ 
  user, 
  onLogout, 
  title = 'Some Game',
  subtitle = 'Challenge yourself and compete'
}: AppHeaderProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Paper
      elevation={0}
      sx={{
        position: 'relative',
        zIndex: 1,
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: 0,
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        py: { xs: 2, sm: 3 },
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Logo and Brand */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: { xs: 40, sm: 48 },
                height: { xs: 40, sm: 48 },
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                borderRadius: theme.shape.borderRadius,
                boxShadow: theme.shadows[4],
              }}
            >
              <SportsEsportsIcon
                sx={{
                  fontSize: { xs: 24, sm: 28 },
                  color: 'white',
                }}
              />
            </Box>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  color: 'white',
                  fontWeight: 700,
                  fontSize: { xs: '1rem', sm: '1.25rem' },
                  background: 'linear-gradient(135deg, #ffffff 0%, #e0e7ff 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {title}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  display: { xs: 'none', sm: 'block' },
                }}
              >
                {subtitle}
              </Typography>
            </Box>
          </Box>

          {/* User Info and Logout */}
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
              <Avatar
                src={user.photoURL || undefined}
                alt={user.displayName || 'User'}
                sx={{
                  width: { xs: 36, sm: 40 },
                  height: { xs: 36, sm: 40 },
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                }}
              >
                {user.displayName?.[0] || user.email?.[0] || '?'}
              </Avatar>
              <Tooltip title="Logout">
                <IconButton
                  onClick={onLogout}
                  size="small"
                  sx={{
                    color: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    },
                  }}
                >
                  <LogoutIcon />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Box>
      </Container>
    </Paper>
  );
}
