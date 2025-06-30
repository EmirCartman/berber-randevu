import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useDispatch, useSelector } from 'react-redux';
import { getBarbers } from '../../redux/slices/barberSlice';
import axios from 'axios';

const ServiceManagement = () => {
  const dispatch = useDispatch();
  const { barbers } = useSelector((state) => state.barbers);
  const [services, setServices] = useState([]);
  const [selectedBarber, setSelectedBarber] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    duration: '30'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(getBarbers());
  }, [dispatch]);

  useEffect(() => {
    if (selectedBarber) {
      fetchServices();
    }
  }, [selectedBarber]);

  const fetchServices = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/services/barber/${selectedBarber}`);
      setServices(response.data);
    } catch (error) {
      setError('Hizmetler yüklenirken bir hata oluştu');
    }
  };

  const handleOpenDialog = (service = null) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        price: service.price,
        duration: service.duration
      });
    } else {
      setEditingService(null);
      setFormData({
        name: '',
        price: '',
        duration: '30'
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingService(null);
    setFormData({
      name: '',
      price: '',
      duration: '30'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const serviceData = {
        ...formData,
        barberId: selectedBarber
      };

      if (editingService) {
        await axios.put(`http://localhost:5000/api/services/${editingService._id}`, serviceData);
        setSuccess('Hizmet başarıyla güncellendi');
      } else {
        await axios.post('http://localhost:5000/api/services', serviceData);
        setSuccess('Hizmet başarıyla eklendi');
      }

      handleCloseDialog();
      fetchServices();
    } catch (error) {
      setError(error.response?.data?.message || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (serviceId) => {
    if (window.confirm('Bu hizmeti silmek istediğinizden emin misiniz?')) {
      try {
        await axios.delete(`http://localhost:5000/api/services/${serviceId}`);
        setSuccess('Hizmet başarıyla silindi');
        fetchServices();
      } catch (error) {
        setError('Hizmet silinirken bir hata oluştu');
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Hizmet Yönetimi
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
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Berber Seçin
              </Typography>
              <select
                value={selectedBarber}
                onChange={(e) => setSelectedBarber(e.target.value)}
                style={{ width: '100%', padding: '8px', marginBottom: '16px' }}
              >
                <option value="">Berber Seçin</option>
                {barbers.map((barber) => (
                  <option key={barber._id} value={barber._id}>
                    {barber.name}
                  </option>
                ))}
              </select>

              {selectedBarber && (
                <>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleOpenDialog()}
                    sx={{ mb: 2 }}
                  >
                    Yeni Hizmet Ekle
                  </Button>

                  <List>
                    {services.map((service) => (
                      <ListItem key={service._id}>
                        <ListItemText
                          primary={service.name}
                          secondary={`${service.price} TL - ${service.duration} dakika`}
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            aria-label="edit"
                            onClick={() => handleOpenDialog(service)}
                            sx={{ mr: 1 }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            edge="end"
                            aria-label="delete"
                            onClick={() => handleDelete(service._id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {editingService ? 'Hizmet Düzenle' : 'Yeni Hizmet Ekle'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Hizmet Adı"
              type="text"
              fullWidth
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Fiyat (TL)"
              type="number"
              fullWidth
              required
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Süre (dakika)"
              type="number"
              fullWidth
              required
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>İptal</Button>
            <Button type="submit" variant="contained" color="primary" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : (editingService ? 'Güncelle' : 'Ekle')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default ServiceManagement; 