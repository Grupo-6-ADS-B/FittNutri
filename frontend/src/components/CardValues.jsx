import { Box, Typography, Paper } from '@mui/material';

function CardValues({ title, description, icon: Icon, image, color }) {
return (
    <Paper sx={{ backgroundColor: color, borderRadius: 2, p: 4, minHeight: 200, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      {Icon && <Icon sx={{ fontSize: '2rem', mb: 2, color: 'primary.main' }} />}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>{title}</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>{description}</Typography>
      {image && <img src={image} alt={title} style={{ marginTop: '1rem', maxWidth: '100%' }} />}
    </Paper>
)
}

export { CardValues };  