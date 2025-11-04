import { Box } from '@mui/material';

function Section({ 
  children, 
  background = '#ffffff',
  backgroundImage,
  backgroundSize,
  backgroundPosition,
  backgroundRepeat,
  overlay,
  overlayOpacity,
  ...props 
}) {
  const backgroundStyle = backgroundImage 
    ? {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: backgroundSize || 'cover',
        backgroundPosition: backgroundPosition || 'center',
        backgroundRepeat: backgroundRepeat  || 'no-repeat',
        backgroundColor: background, 
      }
    : { background };

  return (
    <Box 
      sx={{
        ...backgroundStyle,
        width: '100vw',
        position: 'relative',
        left: '50%',
        right: '50%',
        marginLeft: '-50vw',
        marginRight: '-50vw',
        py: { xs: 8, md: 16 },
        minHeight: '90vh',
        display: 'flex',
        alignItems: 'center',
        ...props.sx
      }}
      {...props}
    >
      {backgroundImage && overlay && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: overlay,
            opacity: overlayOpacity || 0.5,
            zIndex: 1,
          }}
        />
      )}
      
      <Box sx={{ position: 'relative', zIndex: 2, width: '100%' }}>
        {children}
      </Box>
    </Box>
  );
}

export { Section };