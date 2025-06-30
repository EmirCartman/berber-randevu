import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import {
  People as PeopleIcon,
  ContentCut as ContentCutIcon,
  CalendarToday as CalendarTodayIcon,
  Add as AddIcon,
} from '@mui/icons-material';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  const adminFeatures = [
    {
      title: 'Berber Yönetimi',
      description: 'Berberleri ekleyin, düzenleyin ve yönetin',
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      path: '/add-barber',
    },
    {
      title: 'Hizmet Yönetimi',
      description: 'Berber hizmetlerini ekleyin ve düzenleyin',
      icon: <ContentCutIcon sx={{ fontSize: 40 }} />,
      path: '/add-service',
    },
    {
      title: 'Randevu Yönetimi',
      description: 'Tüm randevuları görüntüleyin ve yönetin',
      icon: <CalendarTodayIcon sx={{ fontSize: 40 }} />,
      path: '/barber-services',
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Paneli
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Hoş geldiniz, {user?.name}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {adminFeatures.map((feature, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  {feature.icon}
                </Box>
                <Typography gutterBottom variant="h5" component="h2" align="center">
                  {feature.title}
                </Typography>
                <Typography align="center" color="text.secondary">
                  {feature.description}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate(feature.path)}
                >
                  Yönet
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Hızlı İşlemler
        </Typography>
        <Grid container spacing={2}>
          <Grid item>
            <Button
              variant="outlined"
              onClick={() => navigate('/users')}
              startIcon={<PeopleIcon />}
            >
              Kullanıcıları Görüntüle
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              onClick={() => navigate('/admin/services')}
              startIcon={<ContentCutIcon />}
            >
              Hizmetleri Yönet
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              onClick={() => navigate('/admin/users')}
              startIcon={<PeopleIcon />}
            >
              Kullanıcıları Yönet
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default AdminDashboard; 