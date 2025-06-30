import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const AppointmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        console.log('Fetching appointment:', { id, hasToken: !!token });
        
        const response = await axios.get(`${API_URL}/appointments/${id}`, { headers });
        console.log('Appointment fetched:', response.data);
        
        setAppointment(response.data);
      } catch (error) {
        console.error('Error fetching appointment:', {
          error: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        setError(error.response?.data?.message || 'Randevu bilgileri yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [id]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Box py={4}>
          <Alert severity="error">{error}</Alert>
        </Box>
      </Container>
    );
  }

  if (!appointment) {
    return (
      <Container maxWidth="lg">
        <Box py={4}>
          <Alert severity="info">Randevu bulunamadı</Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Button
          variant="outlined"
          onClick={() => navigate(-1)}
          sx={{ mb: 3 }}
        >
          Geri Dön
        </Button>

        <Typography variant="h4" gutterBottom>
          Randevu Detayları
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  {appointment.services?.[0]?.serviceId?.name || 'Hizmet bilgisi bulunamadı'}
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  Tarih: {new Date(appointment.date).toLocaleDateString('tr-TR')}
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  Saat: {appointment.time}
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  Durum: {appointment.status}
                </Typography>

                {appointment.photos && (
                  <>
                    <Divider sx={{ my: 3 }} />
                    <Typography variant="h6" gutterBottom>
                      Fotoğraflar
                    </Typography>
                    <Grid container spacing={2}>
                      {appointment.photos.before?.map((photo, index) => (
                        <Grid item xs={12} sm={6} key={`before-${index}`}>
                          <Card>
                            <CardMedia
                              component="img"
                              height="200"
                              image={`http://localhost:5000${photo.url}`}
                              alt={`Öncesi ${index + 1}`}
                            />
                            <CardContent>
                              <Typography variant="body2" color="text.secondary">
                                {photo.description}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                      {appointment.photos.after?.map((photo, index) => (
                        <Grid item xs={12} sm={6} key={`after-${index}`}>
                          <Card>
                            <CardMedia
                              component="img"
                              height="200"
                              image={`http://localhost:5000${photo.url}`}
                              alt={`Sonrası ${index + 1}`}
                            />
                            <CardContent>
                              <Typography variant="body2" color="text.secondary">
                                {photo.description}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Berber Bilgileri
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}
                  onClick={() => navigate(`/barber/${appointment.barberId._id}`)}
                >
                  {appointment.barberId?.avatar && (
                    <CardMedia
                      component="img"
                      sx={{
                        width: 120,
                        height: 120,
                        borderRadius: '50%',
                        mb: 2
                      }}
                      image={`http://localhost:5000${appointment.barberId.avatar}`}
                      alt={appointment.barberId?.name || 'Berber'}
                    />
                  )}
                  <Typography variant="h6" gutterBottom>
                    {appointment.barberId?.name || 'Berber bilgisi bulunamadı'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center">
                    {appointment.barberId?.bio || 'Berber biyografisi bulunamadı'}
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{ mt: 2 }}
                  >
                    Berber Profilini Görüntüle
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default AppointmentDetail; 