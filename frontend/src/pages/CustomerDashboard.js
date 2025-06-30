import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Paper,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import AppointmentForm from '../components/AppointmentForm';
import AppointmentList from '../components/AppointmentList';

const API_URL = 'http://localhost:5000/api';

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const [openForm, setOpenForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Axios instance oluştur
  const api = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  // Request interceptor
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError(null);

        // Token kontrolü
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        // Auth kontrolü
        const authResponse = await api.get('/auth/profile');
        const user = authResponse.data;
        
        if (!user || user.role !== 'customer') {
          navigate('/');
          return;
        }

        // Randevuları getir
        const appointmentsResponse = await api.get('/appointments/customer');
        setAppointments(appointmentsResponse.data);
        
      } catch (error) {
        console.error('Error loading dashboard:', error);
        setError('Randevular yüklenirken bir hata oluştu');
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []); // Sadece bir kez çalışır

  const handleRefresh = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/appointments/customer');
      setAppointments(response.data);
    } catch (error) {
      console.error('Error refreshing appointments:', error);
      setError('Randevular yenilenirken bir hata oluştu');
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      await api.patch(`/appointments/${appointmentId}/status`, { status: newStatus });
      await handleRefresh();
    } catch (error) {
      console.error('Error updating appointment status:', error);
      setError('Randevu durumu güncellenirken bir hata oluştu');
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    try {
      await api.put(`/appointments/${appointmentId}/cancel`);
      await handleRefresh();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      setError('Randevu iptal edilirken bir hata oluştu');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">
          Müşteri Paneli
        </Typography>
        <Box>
          <Tooltip title="Yenile">
            <IconButton onClick={handleRefresh} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setOpenForm(true)}
            sx={{ ml: 2 }}
          >
            Yeni Randevu
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            {loading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : (
              <AppointmentList
                appointments={appointments}
                onStatusUpdate={handleStatusUpdate}
                onCancel={handleCancelAppointment}
                userRole="customer"
              />
            )}
          </Paper>
        </Grid>
      </Grid>

      <Dialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedAppointment ? 'Randevuyu Düzenle' : 'Yeni Randevu'}
        </DialogTitle>
        <DialogContent>
          <AppointmentForm
            initialData={selectedAppointment}
            onSuccess={() => {
              setOpenForm(false);
              setSelectedAppointment(null);
              handleRefresh();
            }}
            onCancel={() => {
              setOpenForm(false);
              setSelectedAppointment(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default CustomerDashboard; 