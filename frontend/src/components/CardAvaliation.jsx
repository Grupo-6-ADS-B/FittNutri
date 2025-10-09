import { Box, Typography } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
function CardAvaliation({ title, description,  }) {

    return (
        <>
        <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', p: 10, m: 2, border: '1px solid rgba(0, 0, 0, 0.06)', borderRadius: 2, boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', backgroundColor: '#ffffff', maxWidth: 300}}>
            <Box sx={{display: 'flex', flexDirection: 'row'}}>
            <StarIcon sx={{color: 'yellow'}} />
            <StarIcon sx={{color: 'yellow'}} />
            <StarIcon sx={{color: 'yellow'}} />
            <StarIcon sx={{color: 'yellow'}} />
            <StarIcon sx={{color: 'yellow'}} />
            </Box>
        <Box>
            <Typography>{title}</Typography>
            <Typography>{description}</Typography>
        </Box>
         </Box>
        </>
    )
}

export { CardAvaliation }
    