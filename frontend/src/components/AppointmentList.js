import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Rating,
  Alert
} from '@mui/material';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

const AppointmentList = ({ appointments, onStatusUpdate, onCancel, userRole }) => {
  if (!appointments || appointments.length === 0) {
    return (
      <Alert severity="info">
        Henüz randevunuz bulunmamaktadır.
      </Alert>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning.main';
      case 'confirmed':
        return 'success.main';
      case 'completed':
        return 'info.main';
      case 'cancelled':
        return 'error.main';
      default:
        return 'text.secondary';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Beklemede';
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

  return (
    <Grid container spacing={3}>
      {appointments.map((appointment) => (
        <Grid item xs={12} md={6} key={appointment._id}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {appointment.barberId?.name || 'Berber Bilgisi Yok'}
              </Typography>
              <Typography color="textSecondary" gutterBottom>
                Tarih: {format(new Date(appointment.date), 'dd MMMM yyyy', { locale: tr })}
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
              {appointment.note && (
                <Box mt={2} p={2} bgcolor="grey.100" borderRadius={1}>
                  <Typography variant="subtitle2" gutterBottom>
                    Berber Notu:
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {appointment.note}
                  </Typography>
                </Box>
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
                          src={photo.url.startsWith('http') ? photo.url : `http://localhost:5000${photo.url}`}
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
                          src={photo.url.startsWith('http') ? photo.url : `http://localhost:5000${photo.url}`}
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
              {appointment.review && (
                <Box mt={2} p={2} bgcolor="grey.100" borderRadius={1}>
                  <Typography variant="subtitle2" gutterBottom>
                    Değerlendirmeniz:
                  </Typography>
                  <Rating value={appointment.review.rating} readOnly />
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    {appointment.review.comment}
                  </Typography>
                  <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                    {format(new Date(appointment.review.createdAt), 'dd MMMM yyyy', { locale: tr })}
                  </Typography>
                </Box>
              )}
              <Box mt={2}>
                {appointment.status === 'pending' && (
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => onCancel(appointment._id)}
                  >
                    İptal Et
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default AppointmentList; 