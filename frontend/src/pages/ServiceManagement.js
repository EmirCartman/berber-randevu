import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Alert,
  CircularProgress
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { getBarbers } from '../redux/slices/barberSlice';
import {
  getBarberServices,
  createService,
  updateService,
  deleteService,
  clearError
} from '../redux/slices/serviceSlice';

const ServiceManagement = () => {
  const dispatch = useDispatch();
  const { barbers, loading: barbersLoading } = useSelector((state) => state.barbers);
  const { services, loading: servicesLoading, error } = useSelector((state) => state.services);

  const [selectedBarber, setSelectedBarber] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: '',
    price: ''
  });

  useEffect(() => {
    dispatch(getBarbers());
  }, [dispatch]);

  useEffect(() => {
    if (selectedBarber) {
      dispatch(getBarberServices(selectedBarber));
    }
  }, [dispatch, selectedBarber]);

  const handleBarberChange = (event) => {
    setSelectedBarber(event.target.value);
  };

  const handleOpenDialog = (service = null) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        description: service.description || '',
        duration: service.duration,
        price: service.price
      });
    } else {
      setEditingService(null);
      setFormData({
        name: '',
        description: '',
        duration: '',
        price: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingService(null);
    setFormData({
      name: '',
      description: '',
      duration: '',
      price: ''
    });
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const serviceData = {
      ...formData,
      barberId: selectedBarber
    };

    if (editingService) {
      await dispatch(updateService({ id: editingService._id, serviceData }));
    } else {
      await dispatch(createService(serviceData));
    }

    handleCloseDialog();
  };

  const handleDelete = async (serviceId) => {
    if (window.confirm('Bu hizmeti silmek istediğinizden emin misiniz?')) {
      await dispatch(deleteService(serviceId));
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
    <Container maxWidth="lg">
      <Box py={4}>
        <Typography variant="h4" gutterBottom>
          Hizmet Yönetimi
        </Typography>

        {error && (
          <Alert severity="error" onClose={() => dispatch(clearError())} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Berber Seçin</InputLabel>
          <Select
            value={selectedBarber}
            onChange={handleBarberChange}
            label="Berber Seçin"
          >
            {barbers.map((barber) => (
              <MenuItem key={barber._id} value={barber._id}>
                {barber.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {selectedBarber && (
          <>
            <Box display="flex" justifyContent="flex-end" mb={2}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleOpenDialog()}
              >
                Yeni Hizmet Ekle
              </Button>
            </Box>

            {servicesLoading ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={3}>
                {services.map((service) => (
                  <Grid item xs={12} sm={6} md={4} key={service._id}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {service.name}
                        </Typography>
                        <Typography color="textSecondary" gutterBottom>
                          {service.description}
                        </Typography>
                        <Typography variant="body2">
                          Süre: {service.duration} dakika
                        </Typography>
                        <Typography variant="body2">
                          Fiyat: {service.price} TL
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenDialog(service)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(service._id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </>
        )}

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingService ? 'Hizmet Düzenle' : 'Yeni Hizmet Ekle'}
          </DialogTitle>
          <form onSubmit={handleSubmit}>
            <DialogContent>
              <TextField
                name="name"
                label="Hizmet Adı"
                value={formData.name}
                onChange={handleInputChange}
                fullWidth
                required
                margin="normal"
              />
              <TextField
                name="description"
                label="Açıklama"
                value={formData.description}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={3}
                margin="normal"
              />
              <TextField
                name="duration"
                label="Süre (dakika)"
                type="number"
                value={formData.duration}
                onChange={handleInputChange}
                fullWidth
                required
                margin="normal"
                inputProps={{ min: 1 }}
              />
              <TextField
                name="price"
                label="Fiyat (TL)"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                fullWidth
                required
                margin="normal"
                inputProps={{ min: 0, step: 0.01 }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>İptal</Button>
              <Button type="submit" variant="contained" color="primary">
                {editingService ? 'Güncelle' : 'Ekle'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Box>
    </Container>
  );
};

export default ServiceManagement; 