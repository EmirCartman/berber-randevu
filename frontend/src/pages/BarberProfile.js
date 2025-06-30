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
  Rating,
  Divider
} from '@mui/material';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const BarberProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [barber, setBarber] = useState(null);
  const [completedAppointments, setCompletedAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBarberData = async () => {
      try {
        const [barberResponse, appointmentsResponse] = await Promise.all([
          axios.get(`${API_URL}/barbers/${id}`),
          axios.get(`${API_URL}/appointments/completed?barberId=${id}`)
        ]);

        setBarber(barberResponse.data);
        setCompletedAppointments(appointmentsResponse.data);
      } catch (error) {
        setError('Berber bilgileri yüklenirken bir hata oluştu');
        console.error('Error fetching barber data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBarberData();
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

  if (!barber) {
    return (
      <Container maxWidth="lg">
        <Box py={4}>
          <Alert severity="info">Berber bulunamadı</Alert>
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

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                  }}
                >
                  {barber.avatar && (
                    <CardMedia
                      component="img"
                      sx={{
                        width: 200,
                        height: 200,
                        borderRadius: '50%',
                        mb: 2
                      }}
                      image={`http://localhost:5000${barber.avatar}`}
                      alt={barber.name}
                    />
                  )}
                  <Typography variant="h4" gutterBottom>
                    {barber.name}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" align="center" paragraph>
                    {barber.bio || 'Berber biyografisi bulunamadı'}
                  </Typography>
                  {barber.rating && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Rating value={barber.rating} readOnly precision={0.5} />
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        ({barber.rating.toFixed(1)})
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Typography variant="h5" gutterBottom>
              Tamamlanan Randevular
            </Typography>
            <Grid container spacing={3}>
              {completedAppointments.map((appointment) => (
                <Grid item xs={12} sm={6} key={appointment._id}>
                  <Card
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/appointments/${appointment._id}`)}
                  >
                    {appointment.photos?.after?.[0] && (
                      <CardMedia
                        component="img"
                        height="200"
                        image={`http://localhost:5000${appointment.photos.after[0].url}`}
                        alt="Randevu sonrası"
                      />
                    )}
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {appointment.services?.[0]?.serviceId?.name || 'Hizmet bilgisi bulunamadı'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Tarih: {new Date(appointment.date).toLocaleDateString('tr-TR')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Saat: {appointment.time}
                      </Typography>
                      {appointment.review && (
                        <Box sx={{ mt: 1 }}>
                          <Rating value={appointment.review.rating} readOnly size="small" />
                          <Typography variant="body2" color="text.secondary">
                            {appointment.review.comment}
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default BarberProfile; 