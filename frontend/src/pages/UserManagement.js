import React, { useEffect, useState } from 'react';
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
  IconButton,
  Alert,
  CircularProgress
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { getUsers, createUser, updateUser, deleteUser } from '../redux/slices/userSlice';

const UserManagement = () => {
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector((state) => state.user);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'barber',
    phone: '',
    isActive: true
  });

  useEffect(() => {
    dispatch(getUsers());
  }, [dispatch]);

  const handleOpenDialog = (user = null) => {
    if (user) {
      setEditingUser(user);
      setUserData({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role,
        phone: user.phone || '',
        isActive: user.isActive
      });
    } else {
      setEditingUser(null);
      setUserData({
        name: '',
        email: '',
        password: '',
        role: 'barber',
        phone: '',
        isActive: true
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
    setUserData({
      name: '',
      email: '',
      password: '',
      role: 'barber',
      phone: '',
      isActive: true
    });
  };

  const handleSubmit = async () => {
    try {
      if (editingUser) {
        await dispatch(updateUser({ id: editingUser._id, ...userData })).unwrap();
      } else {
        await dispatch(createUser(userData)).unwrap();
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Kullanıcı işlemi başarısız:', error);
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
      try {
        await dispatch(deleteUser(userId)).unwrap();
      } catch (error) {
        console.error('Kullanıcı silme işlemi başarısız:', error);
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box mt={2}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Typography variant="h4" gutterBottom>
          Kullanıcı Yönetimi
        </Typography>

        <Box mt={2} mb={2}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Yeni Kullanıcı Ekle
          </Button>
        </Box>

        <Grid container spacing={3}>
          {users.map((user) => (
            <Grid item xs={12} sm={6} md={4} key={user._id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{user.name}</Typography>
                  <Typography color="textSecondary" gutterBottom>
                    {user.email}
                  </Typography>
                  <Typography variant="body2">
                    Rol: {user.role === 'barber' ? 'Berber' : user.role === 'admin' ? 'Admin' : 'Müşteri'}
                  </Typography>
                  {user.phone && (
                    <Typography variant="body2">
                      Telefon: {user.phone}
                    </Typography>
                  )}
                  <Typography variant="body2">
                    Durum: {user.isActive ? 'Aktif' : 'Pasif'}
                  </Typography>
                  <Box mt={2}>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(user)}
                      sx={{ mr: 1 }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(user._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle>
            {editingUser ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı Ekle'}
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Ad Soyad"
              value={userData.name}
              onChange={(e) => setUserData({ ...userData, name: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="E-posta"
              type="email"
              value={userData.email}
              onChange={(e) => setUserData({ ...userData, email: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Şifre"
              type="password"
              value={userData.password}
              onChange={(e) => setUserData({ ...userData, password: e.target.value })}
              margin="normal"
              helperText={editingUser ? "Değiştirmek istemiyorsanız boş bırakın" : ""}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Rol</InputLabel>
              <Select
                value={userData.role}
                onChange={(e) => setUserData({ ...userData, role: e.target.value })}
                label="Rol"
              >
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="barber">Berber</MenuItem>
                <MenuItem value="customer">Müşteri</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Telefon"
              value={userData.phone}
              onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Durum</InputLabel>
              <Select
                value={userData.isActive}
                onChange={(e) => setUserData({ ...userData, isActive: e.target.value })}
                label="Durum"
              >
                <MenuItem value={true}>Aktif</MenuItem>
                <MenuItem value={false}>Pasif</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>İptal</Button>
            <Button onClick={handleSubmit} variant="contained" color="primary">
              {editingUser ? 'Güncelle' : 'Ekle'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default UserManagement; 