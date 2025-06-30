import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Box,
  Rating,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  CircularProgress,
  Tabs,
  Tab
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

const API_URL = 'http://localhost:5000/api';

const BarberDashboard = () => {
  const navigate = useNavigate();
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [photoDialog, setPhotoDialog] = useState(false);
  const [photoType, setPhotoType] = useState('');
  const [photoDescription, setPhotoDescription] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [photoError, setPhotoError] = useState('');
  const [reviewDialog, setReviewDialog] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: 0,
    comment: '',
  });
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [note, setNote] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Axios instance oluştur
  const api = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  // Request interceptor
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError(null);

        // Token kontrolü
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        // Auth kontrolü
        const authResponse = await api.get('/auth/profile');
        const user = authResponse.data;
        
        if (!user || user.role !== 'barber') {
          navigate('/');
          return;
        }

        // Berber randevularını getir (status filtresi olmadan)
        const appointmentsResponse = await api.get('/appointments/barber');
        setAppointments(appointmentsResponse.data);
        
        // İlk tab'ı seç (tüm randevular)
        setTabValue(0);
        
      } catch (error) {
        console.error('Error loading dashboard:', error);
        setError('Randevular yüklenirken bir hata oluştu');
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []); // Sadece bir kez çalışır

  const handleTabChange = async (event, newValue) => {
    setTabValue(newValue);
    setLoading(true);
    
    try {
      const statusMap = {
        0: null, // İlk tab: tüm randevular
        1: 'pending',
        2: 'confirmed',
        3: 'completed',
        4: 'cancelled'
      };
      
      const status = statusMap[newValue];
      let url = '/appointments/barber';
      
      if (status) {
        url = `/appointments/barber?status=${status}`;
      }
      
      const appointmentsResponse = await api.get(url);
      setAppointments(appointmentsResponse.data);
      setError(null);
    } catch (error) {
      console.error('Error loading filtered appointments:', error);
      setError('Randevular yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      await api.put(`/appointments/${appointmentId}/status`, {
        status: newStatus,
        note: note.trim()
      });
      setOpenDialog(false);
      setSelectedAppointment(null);
      setNote('');
      
      // Tüm randevuları yeniden yükle (filtreleme olmadan)
      const appointmentsResponse = await api.get('/appointments/barber');
      setAppointments(appointmentsResponse.data);
      
      setSuccess('Randevu durumu başarıyla güncellendi');
    } catch (error) {
      console.error('Randevu durumu güncellenirken hata:', error);
      setError('Randevu durumu güncellenirken bir hata oluştu');
    }
  };

  const handlePhotoUpload = async (appointmentId, type) => {
    setSelectedAppointment(appointmentId);
    setPhotoType(type);
    setPhotoDescription('');
    setSelectedFiles([]);
    setPhotoError('');
    setPhotoDialog(true);
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 2) {
      setPhotoError('En fazla 2 fotoğraf seçebilirsiniz');
      return;
    }
    setSelectedFiles(files);
    setPhotoError('');
  };

  const handlePhotoSubmit = async () => {
    try {
      if (selectedFiles.length === 0) {
        setPhotoError('Lütfen en az bir fotoğraf seçin');
        return;
      }

      const uploadedUrls = [];
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append('photo', file);

        const response = await api.post('/upload', formData);
        uploadedUrls.push({
          url: response.data.url,
          description: photoDescription,
          uploadedAt: new Date()
        });
      }

      // Mevcut randevuyu bul
      const currentAppointment = appointments.find(app => app._id === selectedAppointment);
      if (!currentAppointment) {
        throw new Error('Randevu bulunamadı');
      }

      // Mevcut fotoğrafları al
      const currentPhotos = currentAppointment.photos || { before: [], after: [] };
      const updatedPhotos = {
        ...currentPhotos,
        [photoType]: [...(currentPhotos[photoType] || []), ...uploadedUrls]
      };

      // Fotoğrafları güncelle
      const response = await api.put(`/appointments/${selectedAppointment}/photos`, {
        photos: updatedPhotos
      });

      console.log('Photo upload response:', response);

      setSuccess('Fotoğraflar başarıyla yüklendi');
      setPhotoDialog(false);
      setPhotoDescription('');
      setSelectedFiles([]);

      // Randevuları yeniden yükle
      const statusMap = {
        0: 'pending',
        1: 'confirmed',
        2: 'completed',
        3: 'cancelled'
      };
      const appointmentsResponse = await api.get(`/appointments/barber?status=${statusMap[tabValue]}`);
      setAppointments(appointmentsResponse.data);
    } catch (error) {
      console.error('Fotoğraf yüklenirken bir hata oluştu:', error);
      setPhotoError('Fotoğraflar yüklenirken bir hata oluştu');
    }
  };

  const handleReviewClick = (appointment) => {
    setSelectedAppointment(appointment);
    setReviewDialog(true);
  };

  const handleReviewSubmit = async () => {
    if (selectedAppointment) {
      try {
        await api.put(`/appointments/${selectedAppointment._id}/review`, {
          review: reviewData
        });
        setReviewDialog(false);
        setReviewData({ rating: 0, comment: '' });
      } catch (error) {
        console.error('Değerlendirme eklenirken bir hata oluştu:', error);
      }
    }
  };

  const handleOpenDialog = (appointment) => {
    setSelectedAppointment(appointment);
    setNote(appointment.note || '');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedAppointment(null);
    setNote('');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'confirmed':
        return 'success';
      case 'completed':
        return 'info';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Onay Bekliyor';
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

  // Loading durumları
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (appointments.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Berber Paneli
        </Typography>
        <Alert severity="info">
          Henüz randevunuz bulunmamaktadır.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Berber Paneli
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

      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Tüm Randevular" />
        <Tab label="Bekleyen Randevular" />
        <Tab label="Onaylanan Randevular" />
        <Tab label="Tamamlanan Randevular" />
        <Tab label="İptal Edilen Randevular" />
      </Tabs>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      ) : appointments.length === 0 ? (
        <Alert severity="info">
          Bu kategoride henüz randevunuz bulunmamaktadır.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {appointments.map((appointment) => (
            <Grid item xs={12} md={6} key={appointment._id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {appointment.customer?.name || 'Müşteri Bilgisi Yok'}
                  </Typography>
                  <Typography color="textSecondary" gutterBottom>
                    Tarih: {new Date(appointment.date).toLocaleDateString('tr-TR')}
                  </Typography>
                  <Typography color="textSecondary" gutterBottom>
                    Saat: {appointment.time}
                  </Typography>
                  <Typography color="textSecondary" gutterBottom>
                    Hizmetler:
                  </Typography>
                  {appointment.services.map((serviceItem, index) => (
                    <Typography key={index} color="textSecondary" gutterBottom>
                      • {serviceItem.serviceId?.name || 'Hizmet Bilgisi Yok'} - {serviceItem.quantity} adet
                    </Typography>
                  ))}
                  <Typography color="textSecondary" gutterBottom>
                    Toplam Fiyat: {appointment.totalPrice} TL
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: getStatusColor(appointment.status) }}
                  >
                    Durum: {getStatusText(appointment.status)}
                  </Typography>
                  {appointment.review && (
                    <Box mt={2} p={2} bgcolor="grey.100" borderRadius={1}>
                      <Typography variant="subtitle2" gutterBottom>
                        Müşteri Değerlendirmesi:
                      </Typography>
                      <Rating value={appointment.review.rating} readOnly />
                      <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                        {appointment.review.comment}
                      </Typography>
                      <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                        {new Date(appointment.review.createdAt).toLocaleDateString('tr-TR')}
                      </Typography>
                    </Box>
                  )}
                  {appointment.note && (
                    <Typography color="textSecondary" gutterBottom>
                      Not: {appointment.note}
                    </Typography>
                  )}
                  {appointment.photos?.before?.length > 0 && (
                    <Box mt={2}>
                      <Typography variant="subtitle2" gutterBottom>
                        Öncesi Fotoğraflar:
                      </Typography>
                      <Grid container spacing={1}>
                        {appointment.photos.before.map((photo, index) => (
                          <Grid item xs={6} key={index}>
                            <Box
                              component="img"
                              src={`http://localhost:5000${photo.url}`}
                              alt={`Öncesi ${index + 1}`}
                              sx={{
                                width: '100%',
                                height: 150,
                                objectFit: 'cover',
                                borderRadius: 1
                              }}
                            />
                            {photo.description && (
                              <Typography variant="caption" color="textSecondary">
                                {photo.description}
                              </Typography>
                            )}
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  )}
                  {appointment.photos?.after?.length > 0 && (
                    <Box mt={2}>
                      <Typography variant="subtitle2" gutterBottom>
                        Sonrası Fotoğraflar:
                      </Typography>
                      <Grid container spacing={1}>
                        {appointment.photos.after.map((photo, index) => (
                          <Grid item xs={6} key={index}>
                            <Box
                              component="img"
                              src={`http://localhost:5000${photo.url}`}
                              alt={`Sonrası ${index + 1}`}
                              sx={{
                                width: '100%',
                                height: 150,
                                objectFit: 'cover',
                                borderRadius: 1
                              }}
                            />
                            {photo.description && (
                              <Typography variant="caption" color="textSecondary">
                                {photo.description}
                              </Typography>
                            )}
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  )}
                  <Box mt={2}>
                    {appointment.status === 'pending' && (
                      <>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleStatusUpdate(appointment._id, 'confirmed')}
                          sx={{ mr: 1 }}
                        >
                          Onayla
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          onClick={() => handleStatusUpdate(appointment._id, 'cancelled')}
                        >
                          İptal Et
                        </Button>
                      </>
                    )}
                    {appointment.status === 'confirmed' && (
                      <Button
                        variant="contained"
                        color="success"
                        onClick={() => handleStatusUpdate(appointment._id, 'completed')}
                      >
                        Tamamlandı
                      </Button>
                    )}
                    {appointment.status === 'completed' && (
                      <>
                        <Button
                          variant="outlined"
                          startIcon={<PhotoCameraIcon />}
                          onClick={() => handlePhotoUpload(appointment._id, 'before')}
                          sx={{ mr: 1 }}
                        >
                          Öncesi Fotoğraf
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<PhotoCameraIcon />}
                          onClick={() => handlePhotoUpload(appointment._id, 'after')}
                          sx={{ mr: 1 }}
                        >
                          Sonrası Fotoğraf
                        </Button>
                      </>
                    )}
                    <Button
                      variant="outlined"
                      onClick={() => handleOpenDialog(appointment)}
                      sx={{ ml: 1 }}
                    >
                      Not Ekle
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Randevu Notu</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Not"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>İptal</Button>
          <Button
            onClick={() => handleStatusUpdate(selectedAppointment._id, selectedAppointment.status)}
            variant="contained"
          >
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={photoDialog} onClose={() => setPhotoDialog(false)}>
        <DialogTitle>
          {photoType === 'before' ? 'Öncesi Fotoğrafları' : 'Sonrası Fotoğrafları'}
        </DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Fotoğraf Açıklaması"
            type="text"
            fullWidth
            value={photoDescription}
            onChange={(e) => setPhotoDescription(e.target.value)}
            sx={{ mb: 2 }}
          />
          <input
            accept="image/*"
            type="file"
            multiple
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            id="photo-upload"
          />
          <label htmlFor="photo-upload">
            <Button
              variant="contained"
              component="span"
              startIcon={<CloudUploadIcon />}
              fullWidth
            >
              Fotoğraf Seç (Max 2)
            </Button>
          </label>
          {selectedFiles.length > 0 && (
            <Box mt={2}>
              <Typography variant="subtitle2">
                Seçilen Fotoğraflar: {selectedFiles.length}
              </Typography>
            </Box>
          )}
          {photoError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {photoError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPhotoDialog(false)}>İptal</Button>
          <Button
            onClick={handlePhotoSubmit}
            variant="contained"
            disabled={selectedFiles.length === 0}
          >
            Yükle
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BarberDashboard; 