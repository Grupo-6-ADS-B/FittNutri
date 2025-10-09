import { Box, Typography, Paper } from '@mui/material';

function CardValues({ title, description, icon: Icon, image, color }) {
return (
    <Paper 
      elevation={0}
      sx={{ 
        backgroundColor: color, 
        borderRadius: 3, 
        p: 4, 
        height: 280,
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center',
        border: '1px solid rgba(0, 0, 0, 0.08)',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
        '&:hover': {
          backgroundColor: '#ffffff',
          borderColor: 'primary.main',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
          '& .card-title': {
            color: 'primary.main'
          }
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, transparent 0%, primary.main 50%, transparent 100%)',
          opacity: 0,
          transition: 'opacity 0.3s ease'
        },
        '&:hover::before': {
          opacity: 1
        }
      }}
    >
      {Icon && <Icon sx={{ fontSize: '2.5rem', mb: 2, color: 'primary.main' }} />}
      <Typography 
        className="card-title"
        variant="h4" 
        sx={{ 
          mb: 2, 
          fontWeight: 700, 
          color: '#1a202c',
          transition: 'color 0.3s ease',
          textAlign: 'center'
        }}
      >
        {title}
      </Typography>
      <Typography 
        variant="h5" 
        sx={{ 
          color: 'text.secondary', 
          lineHeight: 1.6,
          textAlign: 'justify',
        }}
      >
        {description}
      </Typography>
      {image && <img src={image} alt={title} style={{ marginTop: '1rem', maxWidth: '100%' }} />}
    </Paper>
)
}

export { CardValues };  