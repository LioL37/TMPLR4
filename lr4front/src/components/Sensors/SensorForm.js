import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  TextField, 
  Button, 
  Box, 
  Typography, 
  MenuItem,
  FormControlLabel,
  Switch
} from '@mui/material';
import api from '../../api/api';

const SensorForm = () => {
  const { id: buildingId } = useParams();
  const navigate = useNavigate();
  const [sensor, setSensor] = useState({
    type: 'temperature',
    location: '',
    installed_at: new Date().toISOString().split('T')[0], // Текущая дата в формате YYYY-MM-DD
    building_id: parseInt(buildingId),
    is_active: true
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/sensors/', sensor);
      navigate(`/buildings/${buildingId}`);
    } catch (err) {
      if (err.response?.status === 422) {
        const errors = err.response.data.detail;
        const errorMsg = Array.isArray(errors) 
          ? errors.map(e => `${e.loc[1]}: ${e.msg}`).join('\n')
          : 'Неверные данные датчика';
        setError(errorMsg);
      } else {
        setError(err.response?.data?.detail || 'Ошибка при создании датчика');
      }
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 500 }}>
      <Typography variant="h5" gutterBottom>
        Добавить новый датчик
      </Typography>
      
      {error && (
        <Typography color="error" sx={{ whiteSpace: 'pre-line', mb: 2 }}>
          {error}
        </Typography>
      )}
      
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
        </TextField>
        
        <TextField
          label="Местоположение"
          value={sensor.location}
          onChange={(e) => setSensor({...sensor, location: e.target.value})}
          fullWidth
          margin="normal"
          required
        />

        <TextField
          label="Дата установки (ГГГГ-ММ-ДД)"
          type="date"
          value={sensor.installed_at}
          onChange={(e) => setSensor({...sensor, installed_at: e.target.value})}
          fullWidth
          margin="normal"
          required
          InputLabelProps={{
            shrink: true,
          }}
        />

        <FormControlLabel
          control={
            <Switch
              checked={sensor.is_active}
              onChange={(e) => 
                setSensor({...sensor, is_active: e.target.checked})
              }
            />
          }
          label="Активен"
          sx={{ mt: 2 }}
        />
        
        <Button 
          type="submit" 
          variant="contained" 
          fullWidth 
          sx={{ mt: 3 }}
        >
          Сохранить
        </Button>
      </Box>
    </Box>
  );
};

export default SensorForm;