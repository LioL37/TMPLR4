import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Chip,
  Divider,
  Alert,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import api from '../../api/api';

const IncidentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [incident, setIncident] = useState(null);
  const [sensor, setSensor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Получаем данные инцидента
        const incidentRes = await api.get(`/incidents/${id}`);
        setIncident(incidentRes.data);
        
        // Получаем данные связанного датчика
        if (incidentRes.data.sensor_id) {
          const sensorRes = await api.get(`/sensors/${incidentRes.data.sensor_id}`);
          setSensor(sensorRes.data);
        }
      } catch (err) {
        console.error('Ошибка загрузки:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  const handleResolve = async () => {
    try {
      await api.patch(`/incidents/${id}`, { resolved: true });
      setIncident({...incident, resolved: true});
    } catch (err) {
      console.error('Ошибка обновления:', err);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Вы уверены, что хотите удалить этот инцидент?')) {
      try {
        await api.delete(`/incidents/${id}`);
        navigate(sensor ? `/sensors/${sensor.id}` : '/buildings');
      } catch (err) {
        console.error('Ошибка удаления:', err);
      }
    }
  };

  if (loading) return <Typography>Загрузка...</Typography>;
  if (!incident) return <Typography>Инцидент не найден</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" gutterBottom>
            Инцидент #{incident.id}
          </Typography>
          <Chip 
            label={incident.resolved ? 'Решен' : 'Не решен'} 
            color={incident.resolved ? 'success' : 'error'} 
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" paragraph>
            <strong>Уровень опасности:</strong> 
            <Chip 
              label={incident.level} 
              color={
                incident.level === 'critical' ? 'error' : 
                incident.level === 'high' ? 'warning' :
                incident.level === 'medium' ? 'info' : 'success'
              } 
              sx={{ ml: 1 }}
            />
          </Typography>
          
          <Typography variant="body1" paragraph>
            <strong>Дата обнаружения:</strong> {new Date(incident.detected_at).toLocaleString()}
          </Typography>
          
          {incident.resolved && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Инцидент был решен
            </Alert>
          )}

          <Typography variant="body1" paragraph>
            <strong>Описание:</strong> {incident.description || 'Нет описания'}
          </Typography>
        </Box>

        {sensor && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Связанный датчик
            </Typography>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography><strong>Тип:</strong> {sensor.type}</Typography>
              <Typography><strong>Местоположение:</strong> {sensor.location}</Typography>
              <Typography><strong>Статус:</strong> {sensor.is_active ? 'Активен' : 'Неактивен'}</Typography>
              <Button 
                size="small" 
                onClick={() => navigate(`/sensors/${sensor.id}`)}
                sx={{ mt: 1 }}
              >
                Перейти к датчику
              </Button>
            </Paper>
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 2 }}>
          {!incident.resolved && (
            <Button 
              variant="contained" 
              color="success"
              onClick={handleResolve}
            >
              Отметить как решенный
            </Button>
          )}
          <Button 
            variant="outlined" 
            color="error"
            onClick={handleDelete}
          >
            Удалить инцидент
          </Button>
        </Box>
      </Paper>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Действия по инциденту
        </Typography>
        
        <List>
          <ListItem divider>
            <ListItemText
              primary="Инцидент создан"
              secondary={new Date(incident.detected_at).toLocaleString()}
            />
          </ListItem>
          
          {incident.resolved && (
            <ListItem>
              <ListItemText
                primary="Инцидент решен"
                secondary={new Date().toLocaleString()} // Здесь можно добавить дату решения
              />
            </ListItem>
          )}
        </List>
      </Paper>
    </Box>
  );
};

export default IncidentDetail;