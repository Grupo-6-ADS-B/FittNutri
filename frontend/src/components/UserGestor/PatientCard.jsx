import {
  Card,
  Box,
  Avatar,
  Typography,
  Chip,
  Button,
  IconButton
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

export default function PatientCard({ 
  user, 
  onViewData, 
  onSchedule, 
  onDelete 
}) {
  return (
    <Card
      sx={{
        borderRadius: 3,
        backgroundColor: "white",
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
          borderColor: "#2e7d32",
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
          borderBottom: "3px solid #2e7d32",
          backgroundColor: "#fafafa",
        }}
      >
        <Avatar
          src={user.avatar}
          sx={{
            width: 80,
            height: 80,
            border: "3px solid #2e7d32",
            fontSize: "2rem",
            fontWeight: 700,
            backgroundColor: "#2e7d32",
          }}
        >
          {user.name?.charAt(0)}
        </Avatar>
        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: "#1b5e20", mb: 1 }}
          >
            {user.name}
          </Typography>
          <Chip
            label={user.cidade}
            size="small"
            sx={{
              backgroundColor: "#e8f5e9",
              color: "#2e7d32",
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
                color: "#666", 
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
                color: "#333",
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
                color: "#666", 
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
                color: "#333",
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
          borderTop: "1px solid #f0f0f0",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Button
          variant="text"
          size="small"
          onClick={() => onViewData(user)}
          sx={{
            color: "#2e7d32",
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.85rem",
            flex: 1,
            "&:hover": {
              backgroundColor: "#f1f8e9",
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
            backgroundColor: "#2e7d32",
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.85rem",
            flex: 1,
            "&:hover": { backgroundColor: "#256026" },
          }}
        >
          Agendar
        </Button>
        <IconButton
          size="small"
          onClick={() => onDelete(user)}
          sx={{
            color: "#d32f2f",
            padding: "8px",
            "&:hover": {
              backgroundColor: "rgba(211, 47, 47, 0.08)",
            },
          }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Box>
    </Card>
  );
}
