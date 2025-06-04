import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TextField, Button, Box, Typography } from '@mui/material';
import api from '../../api/api';

const BuildingEditForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [building, setBuilding] = useState({ name: '', address: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBuilding = async () => {
      try {
        const response = await api.get(`/buildings/${id}`);
        setBuilding(response.data);
      } catch (err) {
        setError('Не удалось загрузить данные здания');
      }
    };
    fetchBuilding();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/buildings/${id}`, building);
      navigate(`/buildings/${id}`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка при обновлении здания');
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 500 }}>
      <Typography variant="h5" gutterBottom>
        Редактировать здание
      </Typography>
      
      {error && <Typography color="error">{error}</Typography>}
      
      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          label="Название"
          fullWidth
          margin="normal"
          value={building.name}
          onChange={(e) => setBuilding({...building, name: e.target.value})}
          required
        />
        <TextField
          label="Адрес"
          fullWidth
          margin="normal"
          value={building.address}
          onChange={(e) => setBuilding({...building, address: e.target.value})}
          required
        />
        <Button type="submit" variant="contained" sx={{ mt: 2 }}>
          Сохранить
        </Button>
      </Box>
    </Box>
  );
};

export default BuildingEditForm;