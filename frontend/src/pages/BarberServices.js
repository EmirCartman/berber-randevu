import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const BarberServices = () => {
  const [barbers, setBarbers] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedBarber, setSelectedBarber] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    duration: '',
    description: '',
    category: 'other'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBarbers();
  }, []);

  useEffect(() => {
    if (selectedBarber) {
      fetchServices(selectedBarber);
    }
  }, [selectedBarber]);

  const fetchBarbers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/users/barbers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBarbers(response.data);
    } catch (error) {
      setError('Berberler yüklenirken bir hata oluştu');
    }
  };

  const fetchServices = async (barberId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
        return;
      }

      if (!barberId) {
        setError('Lütfen bir berber seçin');
        return;
      }

      console.log('Hizmetler yükleniyor, berber ID:', barberId);
      const response = await axios.get(`${API_URL}/services/barber/${barberId}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('Yüklenen hizmetler:', response.data);
      setServices(response.data);
    } catch (error) {
      console.error('Hizmet yükleme hatası:', error);
      if (error.response) {
        console.error('Sunucu yanıtı:', error.response.data);
        setError(error.response.data.message || 'Hizmetler yüklenirken bir hata oluştu');
      } else if (error.request) {
        console.error('İstek hatası:', error.request);
        setError('Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.');
      } else {
        console.error('Hata:', error.message);
        setError('Bir hata oluştu. Lütfen tekrar deneyin.');
      }
    }
  };

  const handleOpenDialog = (service = null) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        price: service.price,
        duration: service.duration,
        description: service.description || '',
        category: service.category || 'other'
      });
    } else {
      setEditingService(null);
      setFormData({
        name: '',
        price: '',
        duration: '',
        description: '',
        category: 'other'
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
      duration: '',
      description: '',
      category: 'other'
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const token = localStorage.getItem('token');
      const data = {
        ...formData,
        barberId: selectedBarber,
        price: Number(formData.price),
        duration: Number(formData.duration)
      };

      console.log('Gönderilen hizmet verisi:', data);

      if (editingService) {
        const response = await axios.patch(
          `${API_URL}/services/${editingService._id}`,
          data,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('Güncelleme yanıtı:', response.data);
        setSuccess('Hizmet başarıyla güncellendi');
      } else {
        const response = await axios.post(
          `${API_URL}/services`,
          data,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('Ekleme yanıtı:', response.data);
        setSuccess('Hizmet başarıyla eklendi');
      }

      handleCloseDialog();
      fetchServices(selectedBarber);
    } catch (error) {
      console.error('Hizmet işlemi hatası:', error);
      if (error.response) {
        console.error('Sunucu yanıtı:', error.response.data);
        setError(error.response.data.message || 'Bir hata oluştu');
      } else if (error.request) {
        console.error('İstek hatası:', error.request);
        setError('Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.');
      } else {
        console.error('Hata:', error.message);
        setError('Bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (serviceId) => {
    if (!window.confirm('Bu hizmeti silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/services/${serviceId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Hizmet başarıyla silindi');
      fetchServices(selectedBarber);
    } catch (error) {
      setError(error.response?.data?.message || 'Hizmet silinirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Berber Hizmetleri
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

      <Box sx={{ mb: 4 }}>
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
      </Box>

      {selectedBarber && (
        <>
          <Box sx={{ mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Yeni Hizmet Ekle
            </Button>
          </Box>

          <Grid container spacing={3}>
            {services.map((service) => (
              <Grid item xs={12} sm={6} md={4} key={service._id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {service.name}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Fiyat: {service.price} TL
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Süre: {service.duration} dakika
                    </Typography>
                    {service.description && (
                      <Typography variant="body2" color="text.secondary">
                        {service.description}
                      </Typography>
                    )}
                  </CardContent>
                  <CardActions>
                    <IconButton onClick={() => handleOpenDialog(service)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(service._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {editingService ? 'Hizmet Düzenle' : 'Yeni Hizmet Ekle'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Hizmet Adı"
              name="name"
              value={formData.name}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Fiyat (TL)"
              name="price"
              type="number"
              value={formData.price}
              onChange={handleChange}
              margin="normal"
              required
              inputProps={{ min: 0 }}
            />
            <TextField
              fullWidth
              label="Süre (Dakika)"
              name="duration"
              type="number"
              value={formData.duration}
              onChange={handleChange}
              margin="normal"
              required
              inputProps={{ min: 15 }}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Kategori</InputLabel>
              <Select
                name="category"
                value={formData.category}
                onChange={handleChange}
                label="Kategori"
              >
                <MenuItem value="haircut">Saç Kesimi</MenuItem>
                <MenuItem value="beard">Sakal</MenuItem>
                <MenuItem value="coloring">Boya</MenuItem>
                <MenuItem value="styling">Şekillendirme</MenuItem>
                <MenuItem value="other">Diğer</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Açıklama"
              name="description"
              value={formData.description}
              onChange={handleChange}
              margin="normal"
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>İptal</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Kaydet'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BarberServices; 