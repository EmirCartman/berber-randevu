import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [editDialog, setEditDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: '',
  });
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (error) {
      setError('Kullanıcılar yüklenirken bir hata oluştu');
    }
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      avatar: user.avatar || '',
    });
    setEditDialog(true);
  };

  const handleClose = () => {
    setEditDialog(false);
    setSelectedUser(null);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
        return;
      }

      // Validate form data
      if (!formData.name || !formData.email) {
        setError('Ad Soyad ve E-posta alanları zorunludur.');
        return;
      }

      if (!selectedUser || !selectedUser._id) {
        setError('Kullanıcı ID bulunamadı.');
        return;
      }

      console.log('Gönderilen veri:', {
        userId: selectedUser._id,
        formData,
        url: `${API_URL}/users/${selectedUser._id}`
      });

      const response = await axios.patch(
        `${API_URL}/users/${selectedUser._id}`,
        formData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );

      console.log('Sunucu yanıtı:', response.data);

      setSuccess('Kullanıcı başarıyla güncellendi');
      setError(''); // Başarılı durumda hata mesajını temizle
      fetchUsers();
      handleClose();
    } catch (error) {
      console.error('Kullanıcı güncelleme hatası:', error);
      
      if (error.response) {
        // Sunucudan gelen hata mesajı
        console.error('Sunucu yanıtı:', error.response.data);
        setError(error.response.data.message || 'Kullanıcı güncellenirken bir hata oluştu.');
      } else if (error.request) {
        // İstek yapıldı ama cevap alınamadı
        console.error('İstek hatası:', error.request);
        setError('Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.');
      } else {
        // İstek oluşturulurken hata oluştu
        console.error('İstek oluşturma hatası:', error.message);
        setError('Bir hata oluştu. Lütfen tekrar deneyin.');
      }
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'barber':
        return 'primary';
      case 'customer':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Kullanıcılar
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Ad Soyad</TableCell>
              <TableCell>E-posta</TableCell>
              <TableCell>Telefon</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell>İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phone || '-'}</TableCell>
                <TableCell>
                  <Chip
                    label={user.role === 'admin' ? 'Admin' : user.role === 'barber' ? 'Berber' : 'Müşteri'}
                    color={getRoleColor(user.role)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEditClick(user)}>
                    <EditIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={editDialog} onClose={handleClose}>
        <DialogTitle>Kullanıcı Düzenle</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Ad Soyad"
            name="name"
            value={formData.name}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="E-posta"
            name="email"
            value={formData.email}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Telefon"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Profil Fotoğrafı URL"
            name="avatar"
            value={formData.avatar}
            onChange={handleChange}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>İptal</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Users; 