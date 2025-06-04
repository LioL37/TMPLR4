import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button, 
  List, 
  ListItem, 
  Paper,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import api from '../../api/api';
import { useAuth } from '../Auth/AuthContext';

const BuildingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [building, setBuilding] = useState(null);
  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [buildingRes, sensorsRes] = await Promise.all([
          api.get(`/buildings/${id}`),
          api.get(`/sensors?building_id=${id}`)
        ]);
        
        setBuilding(buildingRes.data);
        setSensors(sensorsRes.data);
      } catch (err) {
        setError('Не удалось загрузить данные');
        console.error('Ошибка загрузки:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Вы уверены, что хотите удалить это здание?')) return;
    
    try {
      await api.delete(`/buildings/${id}`);
      navigate('/buildings');
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка при удалении здания');
    }
  };

  if (loading) return <CircularProgress sx={{ mt: 4 }} />;
  if (!building) return <Typography>Здание не найдено</Typography>;

  const canEdit = user && (user.id === building.owner_id || user.is_admin);

  return (
    <Box sx={{ p: 3 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Typography variant="h4" gutterBottom component="div">
        {building.name}
      </Typography>
      
      <Typography variant="body1" paragraph component="div">
        <strong>Адрес:</strong> {building.address}
      </Typography>

      {canEdit && (
        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
          <Button 
            variant="contained"
            onClick={() => navigate(`/buildings/${id}/edit`)}
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
      
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom component="div">
          Датчики в здании
        </Typography>
        
        {canEdit && (
          <Button 
            variant="contained" 
            onClick={() => navigate(`/buildings/${id}/add-sensor`)}
            sx={{ mb: 2 }}
          >
            Добавить датчик
          </Button>
        )}
        
        {sensors.length === 0 ? (
          <Typography component="div">Датчики не добавлены</Typography>
        ) : (
          <List component={Paper} disablePadding>
            {sensors.map(sensor => (
              <ListItem 
                key={sensor.id}
                component="div"
                onClick={() => navigate(`/sensors/${sensor.id}`)}
                sx={{
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: '#f5f5f5' },
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  py: 2
                }}
              >
                <Typography component="div">
                  <strong>Тип:</strong> {sensor.type}
                </Typography>
                <Typography component="div">
                  <strong>Местоположение:</strong> {sensor.location}
                </Typography>
                <Typography component="div" sx={{ display: 'flex', alignItems: 'center' }}>
                  <strong>Статус:</strong>
                  <Chip 
                    label={sensor.is_active ? 'Активен' : 'Неактивен'} 
                    size="small"
                    sx={{ ml: 1 }}
                    color={sensor.is_active ? 'success' : 'error'}
                  />
                </Typography>
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Box>
  );
};

export default BuildingDetail;