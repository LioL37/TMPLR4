import { Link, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Button } from '@mui/material';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        {token ? (
          <>
            <Button color="inherit" component={Link} to="/">Главная</Button>
            <Button color="inherit" component={Link} to="/buildings">Здания</Button>
            <Button color="inherit" onClick={handleLogout}>Выйти</Button>
          </>
        ) : (
          <Button color="inherit" component={Link} to="/login">Войти</Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;