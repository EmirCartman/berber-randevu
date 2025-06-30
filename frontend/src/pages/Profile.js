import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Avatar,
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';
import { updateProfile } from '../redux/slices/authSlice';
import axios from 'axios';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';

const Profile = () => {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      });
      if (user.avatar) {
        setPhotoPreview(`http://localhost:5000${user.avatar}`);
      }
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handlePhotoUpload = async () => {
    if (!photoFile) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('photo', photoFile);

      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/auth/profile/photo',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      // Redux state'i güncelle
      dispatch({ 
        type: 'auth/updateProfile/fulfilled', 
        payload: { 
          user: response.data.user 
        } 
      });
      
      setSuccess('Profil fotoğrafı başarıyla güncellendi');
      setPhotoFile(null);
      setPhotoPreview(`http://localhost:5000${response.data.user.avatar}`);
    } catch (error) {
      console.error('Fotoğraf yükleme hatası:', error);
      setSuccess('');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateProfile(formData)).unwrap();
      setSuccess('Profil başarıyla güncellendi');
    } catch (error) {
      console.error('Profil güncelleme hatası:', error);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box py={4}>
        <Typography variant="h4" gutterBottom>
          Profil Bilgileri
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

        <Paper sx={{ p: 3, mb: 3 }}>
          <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
            <Avatar
              src={photoPreview}
              sx={{ width: 120, height: 120, mb: 2 }}
            />
            <input
              accept="image/*"
              type="file"
              onChange={handlePhotoChange}
              style={{ display: 'none' }}
              id="photo-upload"
            />
            <label htmlFor="photo-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<PhotoCameraIcon />}
                disabled={uploading}
              >
                Fotoğraf Seç
              </Button>
            </label>
            {photoFile && (
              <Button
                variant="contained"
                onClick={handlePhotoUpload}
                disabled={uploading}
                sx={{ mt: 1 }}
              >
                {uploading ? 'Yükleniyor...' : 'Fotoğrafı Yükle'}
              </Button>
            )}
          </Box>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Ad Soyad"
              name="name"
              value={formData.name}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="E-posta"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Telefon"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              margin="normal"
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2 }}
              disabled={loading}
            >
              {loading ? 'Güncelleniyor...' : 'Profili Güncelle'}
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default Profile; 