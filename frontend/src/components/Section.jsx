import { Box } from '@mui/material';

function Section({ 
  children, 
  background = '#ffffff',
  py = { xs: 8, md: 16 },
  ...props 
}) {
  return (
    <Box 
      sx={{
        background,
        width: '100vw',
        position: 'relative',
        left: '50%',
        right: '50%',
        marginLeft: '-50vw',
        marginRight: '-50vw',
        py,
        minHeight: '90vh',
        display: 'flex',
        alignItems: 'center',
        ...props.sx
      }}
      {...props}
    >
      {children}
    </Box>
  );
}

export { Section };