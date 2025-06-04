import { TableRow, TableCell, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const BuildingItem = ({ building }) => {
  const navigate = useNavigate();

  return (
    <TableRow>
      <TableCell>{building.id}</TableCell>
      <TableCell>{building.name}</TableCell>
      <TableCell>{building.address}</TableCell>
      <TableCell>
        <Button 
          variant="outlined" 
          onClick={() => navigate(`/buildings/${building.id}`)}
        >
          Подробнее
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default BuildingItem;