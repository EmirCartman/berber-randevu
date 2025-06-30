import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Alert,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CircularProgress
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api';

const Appointment = () => {
  const [barbers, setBarbers] = useState([]);
  const [selectedBarber, setSelectedBarber] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchBarbers();
  }, [user, navigate]);

  const fetchBarbers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
        return;
      }

      console.log('Berberler yükleniyor...');
      const response = await axios.get(`${API_URL}/users/barbers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Yüklenen berberler:', response.data);
      setBarbers(response.data);
    } catch (error) {
      console.error('Berber yükleme hatası:', error);
      if (error.response) {
        setError(error.response.data.message || 'Berberler yüklenirken bir hata oluştu');
      } else if (error.request) {
        setError('Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.');
      } else {
        setError('Bir hata oluştu. Lütfen tekrar deneyin.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedBarber || !selectedDate || !selectedTime) {
      setError('Lütfen tüm alanları doldurun.');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const appointmentData = {
        barberId: selectedBarber,
        date: selectedDate,
        time: selectedTime,
        customerId: user._id
      };

      console.log('Randevu verisi:', appointmentData);

      const response = await axios.post(
        `${API_URL}/appointments`,
        appointmentData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      console.log('Randevu yanıtı:', response.data);
      setSuccess('Randevunuz başarıyla oluşturuldu!');
      setSelectedBarber('');
      setSelectedDate(null);
      setSelectedTime(null);
    } catch (error) {
      console.error('Randevu oluşturma hatası:', error);
      if (error.response) {
        setError(error.response.data.message || 'Randevu oluşturulurken bir hata oluştu');
      } else if (error.request) {
        setError('Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.');
      } else {
        setError('Bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Randevu Al
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {barbers.map((barber) => (
          <Grid item xs={12} sm={6} md={4} key={barber._id}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                border: selectedBarber === barber._id ? '2px solid #1976d2' : 'none'
              }}
              onClick={() => setSelectedBarber(barber._id)}
            >
              <CardMedia
                component="img"
                height="140"
                image={barber.avatar || 'https://via.placeholder.com/140'}
                alt={barber.name}
              />
              <CardContent>
                <Typography gutterBottom variant="h6" component="div">
                  {barber.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {barber.phone || 'Telefon bilgisi yok'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Berber Seçin</InputLabel>
              <Select
                value={selectedBarber}
                label="Berber Seçin"
                onChange={(e) => setSelectedBarber(e.target.value)}
              >
                {barbers.map((barber) => (
                  <MenuItem key={barber._id} value={barber._id}>
                    {barber.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Tarih Seçin"
                value={selectedDate}
                onChange={(newValue) => setSelectedDate(newValue)}
                renderInput={(params) => <TextField {...params} fullWidth />}
                minDate={new Date()}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <TimePicker
                label="Saat Seçin"
                value={selectedTime}
                onChange={(newValue) => setSelectedTime(newValue)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Randevu Al'}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Appointment; 