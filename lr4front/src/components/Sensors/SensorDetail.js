import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Chip,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert
} from '@mui/material';
import api from '../../api/api';
import { useAuth } from '../Auth/AuthContext';

const SensorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sensor, setSensor] = useState(null);
  const [building, setBuilding] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [sensorRes, incidentsRes] = await Promise.all([
          api.get(`/sensors/${id}`),
          api.get(`/incidents?sensor_id=${id}`)
        ]);
        
        setSensor(sensorRes.data);
        setIncidents(incidentsRes.data);

        if (sensorRes.data.building_id) {
          const buildingRes = await api.get(`/buildings/${sensorRes.data.building_id}`);
          setBuilding(buildingRes.data);
        }
      } catch (err) {
        setError('Не удалось загрузить данные датчика');
        console.error('Ошибка загрузки:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Вы уверены, что хотите удалить этот датчик?')) return;
    
    try {
      await api.delete(`/sensors/${id}`);
      navigate(building ? `/buildings/${building.id}` : '/buildings');
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка при удалении датчика');
    }
  };

  const handleResolveIncident = async (incidentId) => {
    try {
      await api.patch(`/incidents/${incidentId}`, { resolved: true });
      setIncidents(incidents.map(i => 
        i.id === incidentId ? {...i, resolved: true} : i
      ));
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка при обновлении инцидента');
    }
  };

  if (loading) return <CircularProgress sx={{ mt: 4 }} />;
  if (!sensor) return <Typography>Датчик не найден</Typography>;

  // Проверяем права: владелец здания или админ
  const canEdit = building && user && (user.id === building.owner_id || user.is_admin);

  return (
    <Box sx={{ p: 3 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography component="h2" variant="h5" gutterBottom>
            Датчик #{sensor.id}
          </Typography>
          <Chip 
            label={sensor.is_active ? 'Активен' : 'Неактивен'} 
            color={sensor.is_active ? 'success' : 'error'} 
          />
        </Box>

        <Typography component="div" sx={{ mt: 2 }}>
          <Typography component="p"><strong>Тип:</strong> {sensor.type}</Typography>
          <Typography component="p"><strong>Местоположение:</strong> {sensor.location}</Typography>
          <Typography component="p"><strong>Дата установки:</strong> {new Date(sensor.installed_at).toLocaleDateString()}</Typography>
          
          {building && (
            <Typography component="p">
              <strong>Здание:</strong> {building.name}
              <Button 
                size="small" 
                onClick={() => navigate(`/buildings/${building.id}`)}
                sx={{ ml: 1 }}
              >
                Подробнее
              </Button>
            </Typography>
          )}
        </Typography>

        {canEdit && (
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Button 
              variant="contained"
              onClick={() => navigate(`/sensors/${id}/edit`)}
            >
              Редактировать
            </Button>
            <Button 
              variant="outlined" 
              color="error"
              onClick={handleDelete}
            >
              Удалить
            </Button>
          </Box>
        )}
      </Paper>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography component="h3" variant="h5" gutterBottom>
          Инциденты
        </Typography>
        
        {incidents.length === 0 ? (
          <Typography>Нет зарегистрированных инцидентов</Typography>
        ) : (
          <List component="div">
            {incidents.map(incident => (
              <ListItem 
                key={incident.id}
                component="div"
                divider
                secondaryAction={
                  !incident.resolved && canEdit && (
                    <Button 
                      color="success"
                      onClick={() => handleResolveIncident(incident.id)}
                    >
                      Решить
                    </Button>
                  )
                }
              >
                <ListItemText
                  primary={`Инцидент #${incident.id}`}
                  secondary={
                    <Typography component="div">
                      <Box component="span" sx={{ display: 'block' }}>
                        <strong>Уровень:</strong> 
                        <Chip 
                          label={incident.level} 
                          size="small"
                          sx={{ ml: 1 }}
                          color={
                            incident.level === 'critical' ? 'error' : 
                            incident.level === 'high' ? 'warning' :
                            'primary'
                          } 
                        />
                      </Box>
                      <Box component="span" sx={{ display: 'block' }}>
                        <strong>Дата:</strong> {new Date(incident.detected_at).toLocaleString()}
                      </Box>
                      <Box component="span" sx={{ display: 'block' }}>
                        <strong>Статус:</strong> 
                        {incident.resolved ? ' Решен' : ' Не решен'}
                      </Box>
                      {incident.description && (
                        <Box component="span" sx={{ display: 'block' }}>
                          <strong>Описание:</strong> {incident.description}
                        </Box>
                      )}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
        
        <Button 
          variant="contained" 
          onClick={() => navigate(`/sensors/${id}/report-incident`)}
          sx={{ mt: 2 }}
        >
          Сообщить об инциденте
        </Button>
      </Paper>
    </Box>
  );
};

export default SensorDetail;