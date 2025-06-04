import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TextField, Button, Box, Typography, MenuItem, Switch, FormControlLabel } from '@mui/material';
import api from '../../api/api';

const SensorEditForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sensor, setSensor] = useState({
    type: '',
    location: '',
    is_active: true
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSensor = async () => {
      try {
        const response = await api.get(`/sensors/${id}`);
        setSensor(response.data);
      } catch (err) {
        setError('Не удалось загрузить данные датчика');
      }
    };
    fetchSensor();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/sensors/${id}`, sensor);
      navigate(`/sensors/${id}`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка при обновлении датчика');
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 500 }}>
      <Typography variant="h5" gutterBottom>
        Редактировать датчик #{id}
      </Typography>
      
      {error && <Typography color="error">{error}</Typography>}
      
      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          select
          label="Тип датчика"
          value={sensor.type}
          onChange={(e) => setSensor({...sensor, type: e.target.value})}
          fullWidth
          margin="normal"
          required
        >
          <MenuItem value="temperature">Температура</MenuItem>
          <MenuItem value="smoke">Дым</MenuItem>
          <MenuItem value="motion">Движение</MenuItem>
          <MenuItem value="water">Вода</MenuItem>
        </TextField>
        
        <TextField
          label="Местоположение"
          value={sensor.location}
          onChange={(e) => setSensor({...sensor, location: e.target.value})}
          fullWidth
          margin="normal"
          required
        />
        
        <FormControlLabel
          control={
            <Switch
              checked={sensor.is_active}
              onChange={(e) => setSensor({...sensor, is_active: e.target.checked})}
            />
          }
          label="Активен"
          sx={{ mt: 1, mb: 2 }}
        />
        
        <Button type="submit" variant="contained" sx={{ mr: 2 }}>
          Сохранить
        </Button>
        <Button 
          variant="outlined" 
          onClick={() => navigate(`/sensors/${id}`)}
        >
          Отмена
        </Button>
      </Box>
    </Box>
  );
};

export default SensorEditForm;