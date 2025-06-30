import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, CircularProgress } from '@mui/material';
import { checkAuth } from './redux/slices/authSlice';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import BarberDashboard from './pages/BarberDashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import AppointmentBooking from './pages/AppointmentBooking';
import Profile from './pages/Profile';
import AddBarber from './pages/AddBarber';
import Users from './pages/Users';
import BarberServices from './pages/BarberServices';
import ServiceManagement from './pages/ServiceManagement';
import UserManagement from './pages/UserManagement';
import AddService from './pages/AddService';
import AdminDashboard from './pages/AdminDashboard';
import AppointmentDetail from './pages/AppointmentDetail';
import BarberProfile from './pages/BarberProfile';

// Components
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const App = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkAuth());
  }, []);

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          minHeight="100vh"
        >
          <CircularProgress />
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          
          {/* Public Routes */}
          <Route
            path="/login"
            element={user ? <Navigate to="/" /> : <Login />}
          />
          <Route
            path="/register"
            element={user ? <Navigate to="/" /> : <Register />}
          />

          {/* Protected Routes */}
          <Route
            path="/customer-dashboard"
            element={
              <PrivateRoute roles={['customer']}>
                <CustomerDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/barber-dashboard"
            element={
              <PrivateRoute roles={['barber']}>
                <BarberDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin-dashboard"
            element={
              <PrivateRoute roles={['admin']}>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/book-appointment"
            element={
              <PrivateRoute roles={['customer']}>
                <AppointmentBooking />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />

          {/* Admin Only Routes */}
          <Route
            path="/add-barber"
            element={
              <PrivateRoute roles={['admin']}>
                <AddBarber />
              </PrivateRoute>
            }
          />
          <Route
            path="/add-service"
            element={
              <PrivateRoute roles={['admin']}>
                <AddService />
              </PrivateRoute>
            }
          />
          <Route
            path="/barber-services"
            element={
              <PrivateRoute roles={['admin']}>
                <BarberServices />
              </PrivateRoute>
            }
          />
          <Route
            path="/users"
            element={
              <PrivateRoute roles={['admin']}>
                <Users />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <PrivateRoute roles={['admin']}>
                <UserManagement />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/services"
            element={
              <PrivateRoute roles={['admin']}>
                <ServiceManagement />
              </PrivateRoute>
            }
          />
          <Route path="/appointments/:id" element={<AppointmentDetail />} />
          <Route path="/barber/:id" element={<BarberProfile />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
