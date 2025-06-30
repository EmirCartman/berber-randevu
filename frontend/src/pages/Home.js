import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Typography, Box, Button, Grid, Card, CardContent, CardMedia, CardActionArea, CircularProgress, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getCustomerAppointments, getBarberAppointments } from '../redux/slices/appointmentSlice';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { items: appointments, loading, error } = useSelector((state) => state.appointments || { items: [], loading: false, error: null });
  const [completedAppointments, setCompletedAppointments] = useState([]);

  useEffect(() => {
    if (user) {
      if (user.role === 'customer') {
        dispatch(getCustomerAppointments());
      } else if (user.role === 'barber') {
        dispatch(getBarberAppointments());
      }
    }

    const fetchCompletedAppointments = async () => {
      try {
        const response = await axios.get(`${API_URL}/appointments/completed`);
        setCompletedAppointments(response.data);
      } catch (error) {
        console.error('Error fetching completed appointments:', error);
      }
    };

    fetchCompletedAppointments();
  }, [dispatch, user]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning.main';
      case 'confirmed':
        return 'success.main';
      case 'completed':
        return 'info.main';
      case 'cancelled':
        return 'error.main';
      default:
        return 'text.secondary';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Beklemede';
      case 'confirmed':
        return 'Onaylandı';
      case 'completed':
        return 'Tamamlandı';
      case 'cancelled':
        return 'İptal Edildi';
      default:
        return status;
    }
  };

  if (!user) {
    return (
      <Container maxWidth="lg">
        <Box py={4}>
          <Typography variant="h4" gutterBottom align="center">
            Berber Randevu Sistemine Hoş Geldiniz
          </Typography>
          <Typography variant="body1" paragraph align="center">
            Randevu almak için lütfen giriş yapın veya kayıt olun.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box mt={4} mb={4} display="flex" justifyContent="center" gap={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/login')}
            >
              Giriş Yap
            </Button>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => navigate('/register')}
            >
              Kayıt Ol
            </Button>
          </Box>

          <Typography variant="h5" gutterBottom>
            Tamamlanan Randevular
          </Typography>

          <Grid container spacing={3}>
            {completedAppointments.map((appointment) => (
              <Grid item xs={12} sm={6} md={4} key={appointment._id}>
                <Card>
                  <CardActionArea onClick={() => navigate(`/appointments/${appointment._id}`)}>
                    {appointment.photos?.after?.[0]?.url && (
                      <CardMedia
                        component="img"
                        height="200"
                        image={`http://localhost:5000${appointment.photos.after[0].url}`}
                        alt="Randevu sonrası fotoğraf"
                      />
                    )}
                    <CardContent>
                      <Typography gutterBottom variant="h6" component="div">
                        {appointment.barberId.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Tarih: {new Date(appointment.date).toLocaleDateString('tr-TR')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Saat: {appointment.time}
                      </Typography>
                      {appointment.photos?.after?.[0]?.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {appointment.photos.after[0].description}
                        </Typography>
                      )}
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4">
            Hoş Geldiniz, {user.name}
          </Typography>
          {user.role === 'customer' && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/book-appointment')}
            >
              Yeni Randevu Al
            </Button>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {user.role === 'customer' && (
          <>
            <Typography variant="h5" gutterBottom>
              Randevularım
            </Typography>
            <Grid container spacing={3}>
              {appointments.map((appointment) => (
                <Grid item xs={12} md={6} key={appointment._id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {appointment.services?.[0]?.serviceId?.name || 'Hizmet Bilgisi Yok'}
                      </Typography>
                      <Typography color="textSecondary" gutterBottom>
                        Berber: {appointment.barberId?.name}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        Tarih: {new Date(appointment.date).toLocaleDateString('tr-TR')}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        Saat: {appointment.time}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: getStatusColor(appointment.status) }}
                      >
                        Durum: {getStatusText(appointment.status)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}

        {user.role === 'barber' && (
          <>
            <Typography variant="h5" gutterBottom>
              Randevularım
            </Typography>
            <Grid container spacing={3}>
              {appointments.map((appointment) => (
                <Grid item xs={12} md={6} key={appointment._id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {appointment.services?.[0]?.serviceId?.name || 'Hizmet Bilgisi Yok'}
                      </Typography>
                      <Typography color="textSecondary" gutterBottom>
                        Müşteri: {appointment.customer?.name}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        Tarih: {new Date(appointment.date).toLocaleDateString('tr-TR')}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        Saat: {appointment.time}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: getStatusColor(appointment.status) }}
                      >
                        Durum: {getStatusText(appointment.status)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </Box>
    </Container>
  );
};

export default Home; 