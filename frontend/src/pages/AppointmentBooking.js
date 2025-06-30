import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  CircularProgress,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import { createAppointment } from '../redux/slices/appointmentSlice';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const AppointmentBooking = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { loading, error } = useSelector((state) => state.appointments);

  const [formData, setFormData] = useState({
    barberId: '',
    serviceId: '',
    date: null,
    time: null,
  });

  const [barbers, setBarbers] = useState([]);
  const [selectedBarberServices, setSelectedBarberServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);

  useEffect(() => {
    const fetchBarbers = async () => {
      try {
        const response = await axios.get(`${API_URL}/users/barbers`);
        setBarbers(response.data);
      } catch (error) {
        console.error('Berberler yüklenirken hata:', error);
      }
    };

    fetchBarbers();
  }, []);

  useEffect(() => {
    const fetchBarberServices = async () => {
      if (!formData.barberId) {
        setSelectedBarberServices([]);
        return;
      }

      setLoadingServices(true);
      try {
        const response = await axios.get(`${API_URL}/services/barber/${formData.barberId}`);
        setSelectedBarberServices(response.data);
      } catch (error) {
        console.error('Hizmetler yüklenirken hata:', error);
        setSelectedBarberServices([]);
      } finally {
        setLoadingServices(false);
      }
    };

    fetchBarberServices();
  }, [formData.barberId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      date
    }));
  };

  const handleTimeChange = (time) => {
    setFormData(prev => ({
      ...prev,
      time
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.barberId || !formData.serviceId || !formData.date || !formData.time) {
      return;
    }

    const appointmentData = {
      barberId: formData.barberId,
      services: [{
        serviceId: formData.serviceId,
        quantity: 1
      }],
      date: formData.date.toISOString().split('T')[0],
      time: formData.time.toTimeString().split(' ')[0].substring(0, 5),
    };

    try {
      const response = await dispatch(createAppointment(appointmentData)).unwrap();
      console.log('Randevu oluşturma başarılı:', response);
      navigate('/customer-dashboard');
    } catch (error) {
      console.error('Randevu oluşturulurken hata:', error);
    }
  };

  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Alert severity="error">Bu sayfayı görüntülemek için giriş yapmalısınız.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" component="h1" gutterBottom align="center">
          Randevu Oluştur
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <FormControl fullWidth margin="normal">
            <InputLabel>Berber Seçin</InputLabel>
            <Select
              name="barberId"
              value={formData.barberId}
              onChange={handleChange}
              label="Berber Seçin"
              required
            >
              {barbers.map((barber) => (
                <MenuItem key={barber._id} value={barber._id}>
                  {barber.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Hizmet Seçin</InputLabel>
            <Select
              name="serviceId"
              value={formData.serviceId}
              onChange={handleChange}
              label="Hizmet Seçin"
              required
              disabled={!formData.barberId || loadingServices}
            >
              {loadingServices ? (
                <MenuItem disabled>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Hizmetler Yükleniyor...
                </MenuItem>
              ) : selectedBarberServices.length === 0 ? (
                <MenuItem disabled>Bu berber için hizmet bulunamadı</MenuItem>
              ) : (
                selectedBarberServices.map((service) => (
                  <MenuItem key={service._id} value={service._id}>
                    {service.name} - {service.price} TL
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ mt: 2, mb: 2 }}>
              <DatePicker
                label="Tarih Seçin"
                value={formData.date}
                onChange={handleDateChange}
                renderInput={(params) => <TextField {...params} fullWidth />}
                minDate={new Date()}
              />
            </Box>

            <Box sx={{ mt: 2, mb: 2 }}>
              <TimePicker
                label="Saat Seçin"
                value={formData.time}
                onChange={handleTimeChange}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Box>
          </LocalizationProvider>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Randevu Oluştur'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default AppointmentBooking; 