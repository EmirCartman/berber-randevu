import Appointment from '../models/appointment.model.js';
import User from '../models/user.model.js';
import Service from '../models/service.model.js';

// Create new appointment (customer only)
export const createAppointment = async (req, res) => {
  try {
    console.log('Create appointment request:', {
      body: req.body,
      user: req.user,
      headers: req.headers
    });

    const { barberId, date, time, services } = req.body;

    // Validate required fields
    if (!barberId || !date || !time || !services || !services.length) {
      console.error('Missing required fields:', { barberId, date, time, services });
      return res.status(400).json({ 
        message: 'Tüm alanlar zorunludur',
        details: {
          barberId: !barberId ? 'Berber seçilmedi' : null,
          date: !date ? 'Tarih seçilmedi' : null,
          time: !time ? 'Saat seçilmedi' : null,
          services: !services || !services.length ? 'Hizmet seçilmedi' : null
        }
      });
    }

    // Check if barber exists and is active
    const barber = await User.findOne({ _id: barberId, role: 'barber', isActive: true });
    if (!barber) {
      console.error('Barber not found or inactive:', { barberId });
      return res.status(404).json({ 
        message: 'Berber bulunamadı',
        details: 'Seçilen berber aktif değil veya sistemde kayıtlı değil'
      });
    }

    // Check if services exist and belong to the barber
    const serviceIds = services.map(service => service.serviceId);
    const validServices = await Service.find({
      _id: { $in: serviceIds },
      barberId: barberId,
      isActive: true
    });

    if (validServices.length !== serviceIds.length) {
      console.error('Invalid services:', {
        requested: serviceIds,
        found: validServices.map(s => s._id)
      });
      return res.status(400).json({ 
        message: 'Geçersiz hizmet seçimi',
        details: 'Seçilen hizmetlerden bazıları geçersiz veya bu berbere ait değil'
      });
    }

    // Calculate total price
    const totalPrice = validServices.reduce((total, service) => {
      const quantity = services.find(s => s.serviceId.toString() === service._id.toString())?.quantity || 1;
      return total + (service.price * quantity);
    }, 0);

    // Create appointment
    const appointment = new Appointment({
      customer: req.user.userId,
      barberId: barberId,
      date,
      time,
      services: services.map(service => ({
        serviceId: service.serviceId,
        quantity: service.quantity || 1
      })),
      status: 'pending',
      totalPrice // Toplam fiyatı doğrudan ekle
    });

    console.log('Creating appointment:', {
      customer: appointment.customer,
      barberId: appointment.barberId,
      date: appointment.date,
      time: appointment.time,
      services: appointment.services,
      totalPrice: appointment.totalPrice
    });

    await appointment.save();

    // Populate appointment details
    await appointment.populate([
      { path: 'customer', select: 'name email phone' },
      { path: 'barberId', select: 'name email phone' },
      { path: 'services.serviceId', select: 'name price duration' }
    ]);

    console.log('Appointment created successfully:', {
      id: appointment._id,
      customer: appointment.customer,
      barber: appointment.barberId,
      totalPrice: appointment.totalPrice
    });

    res.status(201).json({
      message: 'Randevu başarıyla oluşturuldu',
      appointment
    });
  } catch (error) {
    console.error('Appointment creation error:', {
      error: error.message,
      stack: error.stack,
      request: {
        body: req.body,
        user: req.user,
        headers: req.headers
      }
    });
    res.status(500).json({ 
      message: 'Randevu oluşturulurken bir hata oluştu', 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get all appointments (admin only)
export const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('customer', 'name email phone')
      .populate('barberId', 'name email phone')
      .populate('services.serviceId', 'name price duration')
      .sort({ date: -1, time: -1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching appointments', error: error.message });
  }
};

// Get appointment by ID (public)
export const getAppointmentById = async (req, res) => {
  try {
    console.log('Fetching appointment:', {
      appointmentId: req.params.id,
      user: req.user ? { role: req.user.role, userId: req.user.userId } : 'not logged in',
      headers: req.headers
    });

    if (!req.params.id) {
      console.error('No appointment ID provided');
      return res.status(400).json({ message: 'Randevu ID\'si gerekli' });
    }

    const appointment = await Appointment.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate('barberId', 'name email phone avatar bio')
      .populate('services.serviceId', 'name price duration');

    if (!appointment) {
      console.log('Appointment not found:', req.params.id);
      return res.status(404).json({ message: 'Randevu bulunamadı' });
    }

    console.log('Found appointment:', {
      id: appointment._id,
      status: appointment.status,
      customer: appointment.customer?._id,
      barberId: appointment.barberId?._id,
      services: appointment.services?.length,
      customerId: appointment.customer?._id?.toString(),
      barberIdStr: appointment.barberId?._id?.toString()
    });

    // Tamamlanmış randevular herkese açık
    if (appointment.status === 'completed') {
      console.log('Returning completed appointment');
      return res.json(appointment);
    }

    // Tamamlanmamış randevular için yetki kontrolü
    if (!req.user) {
      console.log('User not logged in, access denied');
      return res.status(403).json({ message: 'Bu randevuyu görüntülemek için giriş yapmalısınız' });
    }

    // Admin her randevuyu görebilir
    if (req.user.role === 'admin') {
      console.log('Admin access granted');
      return res.json(appointment);
    }

    // Müşteri ve berber kendi randevularını görebilir
    const customerId = appointment.customer?._id?.toString();
    const barberId = appointment.barberId?._id?.toString();
    const userId = req.user.userId?.toString();

    console.log('Access check details:', {
      userId,
      customerId,
      barberId,
      userRole: req.user.role
    });

    if (!customerId || !barberId || !userId) {
      console.error('Missing ID in access check:', {
        customerId,
        barberId,
        userId
      });
      return res.status(500).json({ message: 'Randevu erişim bilgileri eksik' });
    }

    const isCustomer = userId === customerId;
    const isBarber = userId === barberId;

    console.log('Access check result:', {
      isCustomer,
      isBarber
    });

    if (isCustomer || isBarber) {
      console.log('Access granted to customer/barber');
      return res.json(appointment);
    }

    console.log('Access denied');
    return res.status(403).json({ message: 'Bu randevuyu görüntüleme yetkiniz yok' });
  } catch (error) {
    console.error('Detailed error in getAppointmentById:', {
      error: error.message,
      stack: error.stack,
      appointmentId: req.params.id,
      user: req.user ? { role: req.user.role, userId: req.user.userId } : 'not logged in',
      headers: req.headers
    });
    res.status(500).json({ 
      message: 'Randevu bilgileri yüklenirken bir hata oluştu', 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Update appointment (admin only)
export const updateAppointment = async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['date', 'time', 'status', 'services'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).json({ message: 'Invalid updates' });
  }

  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    updates.forEach(update => appointment[update] = req.body[update]);
    await appointment.save();

    // Recalculate total price if services were updated
    if (updates.includes('services')) {
      appointment.totalPrice = await appointment.calculatedTotal;
      await appointment.save();
    }

    await appointment.populate([
      { path: 'customer', select: 'name email phone' },
      { path: 'barberId', select: 'name email phone' },
      { path: 'services.serviceId', select: 'name price duration' }
    ]);

    res.json({
      message: 'Appointment updated successfully',
      appointment
    });
  } catch (error) {
    res.status(400).json({ message: 'Error updating appointment', error: error.message });
  }
};

// Delete appointment (admin only)
export const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting appointment', error: error.message });
  }
};

// Get barber appointments (barber only)
export const getBarberAppointments = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'Yetkilendirme başarısız: Kullanıcı bilgisi bulunamadı' });
    }

    const { status } = req.query;
    const query = { barberId: req.user.userId };
    
    if (status) {
      query.status = status;
    }

    const appointments = await Appointment.find(query)
      .populate('customer', 'name email phone')
      .populate('services.serviceId', 'name price duration')
      .sort({ date: -1, time: -1 });

    res.json(appointments);
  } catch (error) {
    console.error('Error fetching barber appointments:', error);
    res.status(500).json({ message: 'Randevular getirilirken bir hata oluştu', error: error.message });
  }
};

// Get customer appointments (customer only)
export const getCustomerAppointments = async (req, res) => {
  try {
    console.log('Fetching appointments for customer:', req.user.userId);
    
    const appointments = await Appointment.find({ customer: req.user.userId })
      .populate('barberId', 'name email phone')
      .populate('services.serviceId', 'name price duration')
      .sort({ date: -1, time: -1 });

    console.log('Found appointments:', appointments.length);
    
    res.json(appointments);
  } catch (error) {
    console.error('Detailed error in getCustomerAppointments:', {
      error: error.message,
      stack: error.stack,
      userId: req.user?.userId,
      path: error.path,
      code: error.code
    });
    res.status(500).json({ 
      message: 'Error fetching appointments', 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Update appointment status (barber only)
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { status, note, photos } = req.body;
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      barberId: req.user.userId
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    appointment.status = status;
    if (note) {
      appointment.note = note;
    }
    if (photos) {
      appointment.photos = photos;
    }

    await appointment.save();

    await appointment.populate([
      { path: 'customer', select: 'name email phone' },
      { path: 'barberId', select: 'name email phone' },
      { path: 'services.serviceId', select: 'name price duration' }
    ]);

    console.log('Appointment updated:', {
      appointmentId: appointment._id,
      status: appointment.status,
      note: appointment.note,
      photos: appointment.photos
    });

    res.json({
      message: 'Appointment status updated successfully',
      appointment
    });
  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({ message: 'Error updating appointment status', error: error.message });
  }
};

// Update appointment photos (barber only)
export const updateAppointmentPhotos = async (req, res) => {
  try {
    const { beforePhotos, afterPhotos } = req.body;
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      barberId: req.user.userId,
      status: 'completed'
    });

    if (!appointment) {
      return res.status(404).json({ 
        message: 'Randevu bulunamadı veya fotoğraf eklemek için randevunun tamamlanmış olması gerekiyor' 
      });
    }

    // Validate photo arrays
    if (beforePhotos && !Array.isArray(beforePhotos)) {
      return res.status(400).json({ message: 'Öncesi fotoğrafları dizi formatında olmalıdır' });
    }
    if (afterPhotos && !Array.isArray(afterPhotos)) {
      return res.status(400).json({ message: 'Sonrası fotoğrafları dizi formatında olmalıdır' });
    }

    // Update photos
    if (beforePhotos) {
      appointment.photos.before = beforePhotos.map(photo => ({
        url: photo.url,
        description: photo.description || '',
        uploadedAt: new Date()
      }));
    }
    if (afterPhotos) {
      appointment.photos.after = afterPhotos.map(photo => ({
        url: photo.url,
        description: photo.description || '',
        uploadedAt: new Date()
      }));
    }

    await appointment.save();

    await appointment.populate([
      { path: 'customer', select: 'name email phone' },
      { path: 'barberId', select: 'name email phone' },
      { path: 'services.serviceId', select: 'name price duration' }
    ]);

    console.log('Appointment photos updated:', {
      appointmentId: appointment._id,
      beforePhotos: appointment.photos.before.length,
      afterPhotos: appointment.photos.after.length
    });

    res.json({
      message: 'Randevu fotoğrafları başarıyla güncellendi',
      appointment
    });
  } catch (error) {
    console.error('Error updating appointment photos:', error);
    res.status(500).json({ message: 'Randevu fotoğrafları güncellenirken bir hata oluştu', error: error.message });
  }
};

// Get completed appointments (public)
export const getCompletedAppointments = async (req, res) => {
  try {
    const { barberId } = req.query;
    const query = { status: 'completed' };

    if (barberId) {
      query.barberId = barberId;
    }

    const appointments = await Appointment.find(query)
      .populate('customer', 'name avatar')
      .populate('barberId', 'name avatar')
      .populate('services.serviceId', 'name price duration')
      .select('photos review date time')
      .sort({ date: -1, time: -1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching completed appointments', error: error.message });
  }
};

// Add or update review (customer only)
export const addOrUpdateReview = async (req, res) => {
  try {
    console.log('Review request received:', {
      body: req.body,
      params: req.params,
      user: req.user,
      headers: req.headers
    });

    const { rating, comment } = req.body;
    const { id } = req.params;
    const userId = req.user.userId;

    if (!userId) {
      console.error('User ID not found in request:', { user: req.user });
      return res.status(401).json({ message: 'Yetkilendirme başarısız: Kullanıcı bilgisi bulunamadı' });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Geçersiz puan. Lütfen 1-5 arasında bir puan verin.' });
    }

    if (!comment || comment.trim().length === 0) {
      return res.status(400).json({ message: 'Lütfen bir yorum yazın.' });
    }

    // Randevuyu bul ve müşteri kontrolü yap
    const appointment = await Appointment.findOne({
      _id: id,
      customer: userId
    }).populate('customer', 'name email')
      .populate({
        path: 'services.serviceId',
        select: 'name price duration'
      });

    if (!appointment) {
      console.error('Appointment not found or unauthorized:', {
        id,
        userId
      });
      return res.status(404).json({ message: 'Randevu bulunamadı veya bu randevu için değerlendirme yapma yetkiniz yok' });
    }

    // Randevu durumu kontrolü
    if (appointment.status !== 'completed') {
      console.error('Invalid appointment status for review:', {
        id,
        status: appointment.status
      });
      return res.status(400).json({ message: 'Sadece tamamlanmış randevular değerlendirilebilir' });
    }

    // Değerlendirme verilerini hazırla
    const reviewData = {
      rating,
      comment: comment.trim(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Değerlendirmeyi güncelle veya ekle
    await Appointment.updateOne(
      { _id: id },
      { $set: { review: reviewData } }
    );

    // Güncellenmiş randevuyu getir
    const updatedAppointment = await Appointment.findById(id)
      .populate('customer', 'name email')
      .populate({
        path: 'services.serviceId',
        select: 'name price duration'
      });

    console.log('Review added/updated successfully:', {
      id,
      review: reviewData
    });

    res.json({
      message: appointment.review ? 'Değerlendirme güncellendi' : 'Değerlendirme eklendi',
      appointment: updatedAppointment
    });
  } catch (error) {
    console.error('Error in addOrUpdateReview:', {
      error: error.message,
      stack: error.stack,
      id: req.params.id,
      userId: req.user?.userId
    });
    res.status(500).json({ message: 'Değerlendirme eklenirken bir hata oluştu' });
  }
};

// Get reviews for a barber (public)
export const getBarberReviews = async (req, res) => {
  try {
    const { barberId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const appointments = await Appointment.find({
      barberId,
      status: 'completed',
      review: { $exists: true }
    })
    .populate('customer', 'name avatar')
    .populate('services.serviceId', 'name')
    .select('review date time services')
    .sort({ 'review.createdAt': -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

    const total = await Appointment.countDocuments({
      barberId,
      status: 'completed',
      review: { $exists: true }
    });

    // Calculate average rating
    const averageRating = appointments.reduce((acc, curr) => acc + curr.review.rating, 0) / appointments.length;

    res.json({
      reviews: appointments,
      total,
      averageRating: averageRating.toFixed(1),
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Değerlendirmeler getirilirken hata:', error);
    res.status(500).json({ 
      message: 'Değerlendirmeler getirilirken bir hata oluştu', 
      error: error.message 
    });
  }
};

// Get customer's reviews (customer only)
export const getCustomerReviews = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Yetkilendirme hatası: Kullanıcı bilgisi bulunamadı' });
    }

    const appointments = await Appointment.find({
      customer: userId,
      status: 'completed',
      review: { $exists: true }
    })
    .populate('barberId', 'name avatar')
    .populate('services.serviceId', 'name')
    .select('review date time services')
    .sort({ 'review.createdAt': -1 });

    res.json(appointments);
  } catch (error) {
    console.error('Müşteri değerlendirmeleri getirilirken hata:', error);
    res.status(500).json({ 
      message: 'Değerlendirmeler getirilirken bir hata oluştu', 
      error: error.message 
    });
  }
}; 