import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  CircularProgress
} from '@mui/material';
import { createAppointment } from '../redux/slices/appointmentSlice';
import { getBarbers } from '../redux/slices/barberSlice';
import { getServices } from '../redux/slices/serviceSlice';
import { format } from 'date-fns';

const AppointmentForm = ({ initialData, onSuccess, onCancel }) => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.appointments);
  const { barbers, loading: barbersLoading } = useSelector((state) => state.barbers);
  const { services, loading: servicesLoading } = useSelector((state) => state.services);

  const [formData, setFormData] = useState({
    barberId: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '',
    services: [],
    note: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        barberId: initialData.barberId?._id || '',
        date: format(new Date(initialData.date), 'yyyy-MM-dd'),
        time: initialData.time,
        services: initialData.services.map(s => ({
          serviceId: s.serviceId._id,
          quantity: s.quantity
        })),
        note: initialData.note || ''
      });
    }
  }, [initialData]);

  // Berberler ve hizmetleri yükle
  useEffect(() => {
    dispatch(getBarbers());
    dispatch(getServices());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleServiceChange = (index, field, value) => {
    const newServices = [...formData.services];
    newServices[index] = {
      ...newServices[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      services: newServices
    }));
  };

  const addService = () => {
    setFormData(prev => ({
      ...prev,
      services: [...prev.services, { serviceId: '', quantity: 1 }]
    }));
  };

  const removeService = (index) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(createAppointment(formData)).unwrap();
      onSuccess();
    } catch (error) {
      console.error('Error creating appointment:', error);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      {(barbersLoading || servicesLoading) && (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100px">
          <CircularProgress />
        </Box>
      )}
      
      {!barbersLoading && !servicesLoading && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Berber</InputLabel>
              <Select
                name="barberId"
                value={formData.barberId}
                onChange={handleChange}
                required
                disabled={barbersLoading}
              >
                {(barbers || []).map((barber) => (
                  <MenuItem key={barber._id} value={barber._id}>
                    {barber.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="date"
              name="date"
              label="Tarih"
              value={formData.date}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="time"
              name="time"
              label="Saat"
              value={formData.time}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ mb: 2 }}>
              <Button
                variant="outlined"
                onClick={addService}
                sx={{ mb: 2 }}
              >
                Hizmet Ekle
              </Button>
            </Box>

            {formData.services.map((service, index) => (
              <Box key={index} sx={{ mb: 2, display: 'flex', gap: 2 }}>
                <FormControl sx={{ flex: 1 }}>
                  <InputLabel>Hizmet</InputLabel>
                  <Select
                    value={service.serviceId}
                    onChange={(e) => handleServiceChange(index, 'serviceId', e.target.value)}
                    required
                    disabled={servicesLoading}
                  >
                    {(services || []).map((s) => (
                      <MenuItem key={s._id} value={s._id}>
                        {s.name} - {s.price} TL
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  type="number"
                  label="Adet"
                  value={service.quantity}
                  onChange={(e) => handleServiceChange(index, 'quantity', parseInt(e.target.value))}
                  InputProps={{ inputProps: { min: 1 } }}
                  required
                  sx={{ width: '100px' }}
                />

                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => removeService(index)}
                >
                  Kaldır
                </Button>
              </Box>
            ))}
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              name="note"
              label="Not"
              value={formData.note}
              onChange={handleChange}
            />
          </Grid>

          {error && (
            <Grid item xs={12}>
              <Alert severity="error">{error}</Alert>
            </Grid>
          )}

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={onCancel}
                disabled={loading}
              >
                İptal
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading || formData.services.length === 0}
              >
                {loading ? <CircularProgress size={24} /> : 'Kaydet'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default AppointmentForm; 