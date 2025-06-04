import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  TextField, 
  Button, 
  Box, 
  Typography, 
  MenuItem,
  CircularProgress,
  Alert
} from '@mui/material';
import api from '../../api/api';
import { useAuth } from '../Auth/AuthContext';

const IncidentReportForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [incident, setIncident] = useState({
    level: 'medium',
    description: '',
    sensor_id: parseInt(id)  // Преобразуем id в число
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Проверяем, что пользователь авторизован
      if (!user) {
        throw new Error('Требуется авторизация');
      }

      // Подготавливаем данные в формате, ожидаемом Pydantic моделью
      const incidentData = {
        level: incident.level,
        description: incident.description || null, // null вместо пустой строки
        sensor_id: incident.sensor_id,
        detected_at: new Date().toISOString()  // Добавляем текущую дату
      };

      const response = await api.post('/incidents', incidentData);

      if (response.status === 201) {
        navigate(`/sensors/${id}`, {
          state: { success: 'Инцидент успешно создан' }
        });
      }
    } catch (err) {
      console.error('Ошибка при создании инцидента:', err);
      setError(
        err.response?.data?.detail || 
        err.message || 
        'Произошла ошибка при создании инцидента'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      p: 3, 
      maxWidth: 500,
      margin: '0 auto'
    }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Сообщить об инциденте
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Box 
        component="form" 
        onSubmit={handleSubmit}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}
      >
        <TextField
          select
          label="Уровень опасности"
          value={incident.level}
          onChange={(e) => setIncident({...incident, level: e.target.value})}
          fullWidth
          required
          variant="outlined"
        >
          <MenuItem value="low">Низкий</MenuItem>
          <MenuItem value="medium">Средний</MenuItem>
          <MenuItem value="high">Высокий</MenuItem>
          <MenuItem value="critical">Критический</MenuItem>
        </TextField>
        
        <TextField
          label="Описание инцидента"
          value={incident.description}
          onChange={(e) => setIncident({...incident, description: e.target.value})}
          fullWidth
          multiline
          rows={4}
          variant="outlined"
          placeholder="Опишите детали инцидента..."
        />
        
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            sx={{ flex: 1 }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Отправить'
            )}
          </Button>
          
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => navigate(`/sensors/${id}`)}
            sx={{ flex: 1 }}
          >
            Отмена
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default IncidentReportForm;