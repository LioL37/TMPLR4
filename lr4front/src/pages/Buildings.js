import { useEffect, useState } from 'react';
import api from '../api/api';
import BuildingList from '../components/Buildings/BuildingList';
import { Container, Button, Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Buildings = () => {
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        const response = await api.get('/buildings');
        setBuildings(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBuildings();
  }, []);

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Список зданий</Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate('/buildings/new')}
          sx={{ mb: 2 }}
        >
          Добавить здание
        </Button>
      </Box>
      <BuildingList buildings={buildings} loading={loading} />
    </Container>
  );
};

export default Buildings;