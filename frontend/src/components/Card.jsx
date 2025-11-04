import { Paper, Typography, Box } from '@mui/material';

function Card({ title, description, icon: Icon, image, color = 'primary' }) {
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
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        display: 'flex',
        flexDirection: 'column',
        '&:hover': {
          transform: 'translateY(-8px)',
          borderColor: `${color}.main`,
          '& .card-icon': {
            transform: 'scale(1.1) rotate(5deg)',
            color: `${color}.main`,
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
          background: `linear-gradient(90deg, ${color === 'primary' ? '#2e7d32, #388e3c' : '#1976d2, #42a5f5'})`,
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
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              color: `${color}.main`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              fontSize: '1.5rem',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Icon sx={{ fontSize: 'inherit' }} />
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