import { Box, Typography, Avatar } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import StarIcon from '@mui/icons-material/Star';
function CardAvaliation({ title, description, name, date, avatar }) {
  const theme = useTheme();

    return (
        <>
    <Box sx={{display: 'flex',height: 400, width: 370, justifyContent: 'space-between', flexDirection: 'column', alignItems: 'left', m: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 2, boxShadow: theme.shadows[1], backgroundColor: 'background.paper'}}>
            <Box sx={{display: 'flex', flexDirection: 'row', mt: 4, mb: 2, ml: 2}}>
      <StarIcon sx={{ color: theme.palette.warning.main, fontSize: 20, filter: `drop-shadow(0 0 1px ${alpha(theme.palette.common.black, 0.55)})` }} />
      <StarIcon sx={{ color: theme.palette.warning.main, fontSize: 20, filter: `drop-shadow(0 0 1px ${alpha(theme.palette.common.black, 0.55)})` }} />
      <StarIcon sx={{ color: theme.palette.warning.main, fontSize: 20, filter: `drop-shadow(0 0 1px ${alpha(theme.palette.common.black, 0.55)})` }} />
      <StarIcon sx={{ color: theme.palette.warning.main, fontSize: 20, filter: `drop-shadow(0 0 1px ${alpha(theme.palette.common.black, 0.55)})` }} />
      <StarIcon sx={{ color: theme.palette.warning.main, fontSize: 20, filter: `drop-shadow(0 0 1px ${alpha(theme.palette.common.black, 0.55)})` }} />
            </Box>
        <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'left', ml: 2, mr: 2}}>
            <Typography variant="h6" color="text.primary" fontWeight={600} mb={1}>{title}</Typography>
            <Typography variant="body1">{description}</Typography>
        </Box>

    
         <Box sx={{display: 'flex', flexDirection: 'row', alignItems: 'center', ml: 2, mr: 2, mt: 2, gap: 2, mb: 3}}>
            <Avatar
              src={avatar}
              alt={name}
              sx={{
                width: 64,
                height: 64,
              }}
            />
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{name}</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>{date}</Typography>
            </Box>
        </Box>
         </Box>
        </>
    )
}

export { CardAvaliation }
