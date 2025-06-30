import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Divider
} from '@mui/material';
import { AccountCircle } from '@mui/icons-material';
import { logout } from '../redux/slices/authSlice';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    handleClose();
    navigate('/login');
  };

  const handleProfile = () => {
    handleClose();
    navigate('/profile');
  };

  const handleDashboard = () => {
    handleClose();
    if (user?.role === 'admin') {
      navigate('/admin/users');
    } else if (user?.role === 'barber') {
      navigate('/barber-dashboard');
    } else {
      navigate('/customer-dashboard');
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'inherit',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          Berber Randevu
        </Typography>

        {user ? (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {user.role === 'admin' && (
              <Box sx={{ display: 'flex', gap: 2, mr: 2 }}>
                <Button
                  color="inherit"
                  component={RouterLink}
                  to="/add-barber"
                >
                  Berber Ekle
                </Button>
                <Button
                  color="inherit"
                  component={RouterLink}
                  to="/users"
                >
                  Kullanıcılar
                </Button>
                <Button
                  color="inherit"
                  component={RouterLink}
                  to="/barber-services"
                >
                  Berber Hizmetleri
                </Button>
              </Box>
            )}
            {user.role === 'customer' && (
              <Button
                color="inherit"
                component={RouterLink}
                to="/book-appointment"
                sx={{ mr: 2 }}
              >
                Randevu Al
              </Button>
            )}
            {user.role === 'barber' && (
              <Button
                color="inherit"
                component={RouterLink}
                to="/barber-dashboard"
                sx={{ mr: 2 }}
              >
                Randevularım
              </Button>
            )}
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <Avatar
                src={user.avatar ? `http://localhost:5000${user.avatar}` : undefined}
                alt={user.name}
                sx={{ width: 32, height: 32 }}
              />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleProfile}>Profil</MenuItem>
              <MenuItem onClick={handleDashboard}>Panel</MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>Çıkış Yap</MenuItem>
            </Menu>
          </Box>
        ) : (
          <Box>
            <Button
              color="inherit"
              component={RouterLink}
              to="/login"
              sx={{ mr: 1 }}
            >
              Giriş Yap
            </Button>
            <Button
              color="inherit"
              component={RouterLink}
              to="/register"
              variant="outlined"
            >
              Kayıt Ol
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 