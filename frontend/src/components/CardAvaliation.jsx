import { Box, Typography, Avatar, Divider } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
function CardAvaliation({ title, description, name, date, avatar }) {

    return (
        <>
        <Box sx={{display: 'flex',height: 400, width: 370, justifyContent: 'space-between', flexDirection: 'column', alignItems: 'left', m: 2, border: '1px solid rgba(0, 0, 0, 0.06)', borderRadius: 2, boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', backgroundColor: '#ffffff'}}>
            <Box sx={{display: 'flex', flexDirection: 'row', mt: 4, mb: 2, ml: 2}}>
            <StarIcon sx={{ color: '#FFD54F', fontSize: 20, filter: 'drop-shadow(0 0 1px rgba(0,0,0,0.95))' }} />
            <StarIcon sx={{ color: '#FFD54F', fontSize: 20, filter: 'drop-shadow(0 0 1px rgba(0,0,0,0.95))' }} />
            <StarIcon sx={{ color: '#FFD54F', fontSize: 20, filter: 'drop-shadow(0 0 1px rgba(0,0,0,0.95))' }} />
            <StarIcon sx={{ color: '#FFD54F', fontSize: 20, filter: 'drop-shadow(0 0 1px rgba(0,0,0,0.95))' }} />
            <StarIcon sx={{ color: '#FFD54F', fontSize: 20, filter: 'drop-shadow(0 0 1px rgba(0,0,0,0.95))' }} />
            </Box>
        <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'left', ml: 2, mr: 2}}>
            <Typography variant="h6" fontWeight={600} mb={1}>{title}</Typography>
            <Typography variant="body2">{description}</Typography>
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
