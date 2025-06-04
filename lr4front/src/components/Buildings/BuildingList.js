import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress } from '@mui/material';
import BuildingItem from './BuildingItem';

const BuildingList = ({ buildings, loading }) => {
  if (loading) return <CircularProgress />;

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Название</TableCell>
            <TableCell>Адрес</TableCell>
            <TableCell>Действия</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {buildings.map(building => (
            <BuildingItem key={building.id} building={building} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default BuildingList;