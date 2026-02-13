import React from 'react';
import { Card, Typography, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';

export function KPICard({ title, value, icon: IconComponent, colorKey = 'primary' }) {
  const theme = useTheme();
  const colorMain = theme.palette[colorKey]?.main || theme.palette.primary.main;
  const colorDark = theme.palette[colorKey]?.dark || colorMain;
  const accent = theme.palette.secondary?.main || theme.palette.secondary;

  return (
    <Card sx={{ height: 110, minWidth: 230, maxWidth: 260, display: 'flex', flexDirection: 'column', justifyContent: 'center', boxShadow: 3, p: 2 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Typography variant="h6" fontWeight="bold" sx={{ textAlign: 'center', fontSize: '1.3rem', mb: 1 }}>{title}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          <Typography variant="h3" fontWeight="bold" sx={{ textAlign: 'center', color: colorDark }}>{value}</Typography>
          {IconComponent && React.createElement(IconComponent, { sx: { color: accent, fontSize: 32, ml: 1 } })}
        </Box>
      </Box>
    </Card>
  );
}
