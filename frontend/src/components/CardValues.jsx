import { Paper, Box, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects'; 

function CardValues({ title, description, color, icon: Icon = EmojiObjectsIcon }) {
  const theme = useTheme();
  return (
    <Paper
      className="card-root"
      elevation={0}
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        position: 'relative',
        borderRadius: 3,
        overflow: 'hidden',
        transition: 'transform 0.28s cubic-bezier(.25,.8,.25,1), box-shadow 0.28s',
        backgroundColor: 'background.paper',
        backgroundImage: 'none',
        minHeight: { xs: 160, md: 200 },
        display: 'flex',
        flexDirection: 'column',
      }}
    >

      {Icon && ( 
      <Box
        sx={{
          position: 'absolute',
          top: 40,
          left: 16,
          width: 44,
          height: 44,
          borderRadius: '50%',
          backgroundColor: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.18 : 0.95),
          display: 'flex',
          border: `1px solid ${color}`,
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: theme.shadows[1],
          color: color,
          zIndex: 5,
        }}
      >
        <Icon sx={{ fontSize: 20 }} />
      </Box>)}

      <Box sx={{ p: { xs: 3, md: 3.5 }, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <Box sx={{ pt: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, pl: '64px'}}>
            {title}
          </Typography>
          <Typography variant="body1" sx={{ color: theme.palette.text.secondary, lineHeight: 1.6, pl: '64px' }}>
            {description}
          </Typography>
        </Box>
      </Box>

      <style>{`
        @media (hover: hover) and (pointer: fine) {
          .card-root:hover {
            box-shadow: ${theme.shadows[4]};
            transform: scale(1.04);
          }
        }
      `}</style>
    </Paper>
  );
}

export { CardValues };