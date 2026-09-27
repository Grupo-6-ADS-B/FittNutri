import {
  Card,
  Box,
  Avatar,
  Typography,
  Chip,
  Button,
  IconButton
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import DeleteIcon from "@mui/icons-material/Delete";

export default function PatientCard({ 
  user, 
  onViewData, 
  onSchedule, 
  onDelete 
}) {
  const theme = useTheme();

  return (
    <Card
      sx={{
        borderRadius: 3,
        backgroundColor: theme.palette.background.paper,
        boxShadow: 2,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
        border: "2px solid transparent",
        position: "relative",
        "&:hover": {
          transform: "translateY(-6px)",
          boxShadow: 5,
          borderColor: theme.palette.primary.main,
        },
      }}
    >
      <Box
        sx={{
          p: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          borderBottom: `3px solid ${theme.palette.primary.main}`,
          backgroundColor: theme.palette.action.hover,
        }}
      >
        <Avatar
          src={user.avatar}
          sx={{
            width: 80,
            height: 80,
            border: `3px solid ${theme.palette.primary.main}`,
            fontSize: "2rem",
            fontWeight: 700,
            backgroundColor: theme.palette.primary.main,
          }}
        >
          {user.name?.charAt(0)}
        </Avatar>
        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 1 }}
          >
            {user.name}
          </Typography>
          <Chip
            label={user.cidade}
            size="small"
            sx={{
              backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.18 : 0.12),
              color: theme.palette.primary.main,
              fontWeight: 600,
              fontSize: "0.75rem",
              height: 24,
            }}
          />
        </Box>
      </Box>

      <Box sx={{ p: 3, flex: 1 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          <Box>
            <Typography
              variant="caption"
              sx={{ 
                color: theme.palette.text.secondary, 
                fontWeight: 600, 
                fontSize: "0.75rem", 
                textTransform: "uppercase", 
                letterSpacing: "0.5px" 
              }}
            >
              Email
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                color: theme.palette.text.primary,
                mt: 0.5,
                wordBreak: "break-word",
                fontSize: "0.9rem",
              }}
            >
              {user.email}
            </Typography>
          </Box>

          <Box>
            <Typography
              variant="caption"
              sx={{ 
                color: theme.palette.text.secondary, 
                fontWeight: 600, 
                fontSize: "0.75rem", 
                textTransform: "uppercase", 
                letterSpacing: "0.5px" 
              }}
            >
              Telefone
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                color: theme.palette.text.primary,
                mt: 0.5,
                fontSize: "0.9rem",
              }}
            >
              {user.telefone || user.phone}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          gap: 1,
          p: 2.5,
          borderTop: `1px solid ${theme.palette.divider}`,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Button
          variant="text"
          size="small"
          onClick={() => onViewData(user)}
          sx={{
            color: theme.palette.primary.main,
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.85rem",
            flex: 1,
            "&:hover": {
              backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.18 : 0.08),
            },
          }}
        >
          Ver Dados
        </Button>
        <Button
          variant="contained"
          size="small"
          onClick={() => onSchedule(user)}
          sx={{
            backgroundColor: theme.palette.primary.main,
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.85rem",
            flex: 1,
            "&:hover": { backgroundColor: theme.palette.primary.dark },
          }}
        >
          Agendar
        </Button>
        <IconButton
          size="small"
          onClick={() => onDelete(user)}
          sx={{
            color: theme.palette.error.main,
            padding: "8px",
            "&:hover": {
              backgroundColor: alpha(theme.palette.error.main, 0.08),
            },
          }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Box>
    </Card>
  );
}
