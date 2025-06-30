import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getBarbers } from '../redux/slices/barberSlice';
import { createService } from '../redux/slices/serviceSlice';

const AddService = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { barbers, loading: barbersLoading, error: barbersError } = useSelector((state) => state.barbers);
  const { loading: serviceLoading, error: serviceError } = useSelector((state) => state.services);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    barber: ''
  });
  const [formError, setFormError] = useState('');

  React.useEffect(() => {
    dispatch(getBarbers());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Form validasyonu
    if (!formData.name || !formData.price || !formData.duration || !formData.barber) {
      setFormError('Lütfen tüm zorunlu alanları doldurun');
      return;
    }

    try {
      await dispatch(createService(formData)).unwrap();
      navigate('/admin/services');
    } catch (error) {
      setFormError(error || 'Hizmet eklenirken bir hata oluştu');
    }
  };

  if (barbersLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md">
      <Box py={4}>
        <Typography variant="h4" gutterBottom>
          Yeni Hizmet Ekle
        </Typography>

        {(barbersError || serviceError || formError) && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {barbersError || serviceError || formError}
          </Alert>
        )}

        <Card>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  name="name"
                  label="Hizmet Adı"
                  value={formData.name}
                  onChange={handleChange}
                  fullWidth
                  required
                />

                <TextField
                  name="description"
                  label="Açıklama"
                  value={formData.description}
                  onChange={handleChange}
                  multiline
                  rows={4}
                  fullWidth
                />

                <TextField
                  name="price"
                  label="Fiyat (TL)"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  fullWidth
                  required
                  inputProps={{ min: 0 }}
                />

                <TextField
                  name="duration"
                  label="Süre (Dakika)"
                  type="number"
                  value={formData.duration}
                  onChange={handleChange}
                  fullWidth
                  required
                  inputProps={{ min: 1 }}
                />

                <FormControl fullWidth required>
                  <InputLabel>Berber</InputLabel>
                  <Select
                    name="barber"
                    value={formData.barber}
                    onChange={handleChange}
                    label="Berber"
                  >
                    {barbers.map((barber) => (
                      <MenuItem key={barber._id} value={barber._id}>
                        {barber.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  disabled={serviceLoading}
                >
                  {serviceLoading ? <CircularProgress size={24} /> : 'Hizmet Ekle'}
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default AddService; 