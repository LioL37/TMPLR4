import { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import api from '../api/api';

const Dashboard = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const response = await api.get('/incidents?limit=5&resolved=false');
        setIncidents(response.data);
      } catch (err) {
        setError('Не удалось загрузить инциденты');
        console.error('Ошибка загрузки инцидентов:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchIncidents();
  }, []);

  const getSeverityColor = (level) => {
    switch (level) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      default: return 'success';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Панель управления
      </Typography>
      <Typography paragraph sx={{ mb: 4 }}>
        Добро пожаловать в систему пожарной безопасности
      </Typography>

      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Последние инциденты
      </Typography>
      
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <TableContainer component={Paper} sx={{ mb: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Уровень</TableCell>
                <TableCell>Датчик</TableCell>
                <TableCell>Дата</TableCell>
                <TableCell>Статус</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {incidents.length > 0 ? (
                incidents.map((incident) => (
                  <TableRow key={incident.id}>
                    <TableCell>#{incident.id}</TableCell>
                    <TableCell>
                      <Chip 
                        label={incident.level} 
                        color={getSeverityColor(incident.level)}
                      />
                    </TableCell>
                    <TableCell>Датчик #{incident.sensor_id}</TableCell>
                    <TableCell>
                      {new Date(incident.detected_at).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={incident.resolved ? 'Решен' : 'Активен'}
                        color={incident.resolved ? 'success' : 'error'}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Нет активных инцидентов
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Typography variant="body1">
        Всего активных инцидентов: {incidents.length}
      </Typography>
    </Box>
  );
};

export default Dashboard;