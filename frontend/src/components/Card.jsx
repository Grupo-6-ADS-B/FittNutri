import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

function Card({ title, description, icon: IconComponent, image, color = 'primary' }) {
  const theme = useTheme();
  const paletteColor = theme.palette[color] || theme.palette.primary;
  const isDark = theme.palette.mode === 'dark';

  return (
    <Paper
      elevation={0}
      sx={{
        height: 450,
        minWidth: 350,
        maxWidth: 380,
        border: '1px solid rgba(0, 0, 0, 0.06)',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.background.default, isDark ? 0.85 : 1)} 100%)`,
        borderColor: theme.palette.divider,
        display: 'flex',
        flexDirection: 'column',
        '&:hover': {
          transform: 'translateY(-8px)',
          borderColor: paletteColor.main,
          '& .card-icon': {
            transform: 'scale(1.1) rotate(5deg)',
            color: paletteColor.main,
          },
          '& .card-image': {
            transform: 'scale(1.05)',
          },
          '& .card-overlay': {
            opacity: 1,
          }
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(90deg, ${paletteColor.main}, ${paletteColor.light})`,
        }
      }}
    >
      <Box
        className="card-overlay"
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(135deg, ${color === 'primary' ? 'rgba(46, 125, 50, 0.02)' : 'rgba(25, 118, 210, 0.02)'} 0%, transparent 100%)`,
          background: `linear-gradient(135deg, ${alpha(paletteColor.main, 0.06)} 0%, transparent 100%)`,
          opacity: 0,
          transition: 'opacity 0.3s ease',
          pointerEvents: 'none',
        }}
      />

      
      <Box
        sx={{
          height: 200,
          overflow: 'hidden',
          borderRadius: '0 0 16px 16px',
          position: 'relative',
        }}
      >
        <Box
          component="img"
          className="card-image"
          src={image}
          alt={title}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.3s ease',
          }}
        />
        
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            left: 16,
          }}
        >
            <Box
              className="card-icon"
            sx={{
              p: 1.5,
              borderRadius: 2,
              backgroundColor: alpha(theme.palette.background.paper, 0.92),
              color: paletteColor.main,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              fontSize: '1.5rem',
              backdropFilter: 'blur(10px)',
              boxShadow: theme.shadows[1],
            }}
            >
            {IconComponent && React.createElement(IconComponent, { sx: { fontSize: 'inherit' } })}
          </Box>
        </Box>
      </Box>

      <Box sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography
          variant="h6"
          sx={{
            mb: 2,
            fontWeight: 700,
            color: 'text.primary',
            lineHeight: 1.3,
          }}
        >
          {title}
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: 'text.secondary',
            lineHeight: 1.6,
            flexGrow: 1,
          }}
        >
          {description}
        </Typography>
      </Box>
    </Paper>
  );
}

export { Card };