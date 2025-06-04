import Appointment from '../models/appointment.model.js';

// Get all reviews (public)
export const getReviews = async (req, res) => {
  try {
    const { barberId } = req.query;
    const query = { 'review': { $exists: true } };
    
    if (barberId) {
      query.barber = barberId;
    }

    const appointments = await Appointment.find(query)
      .populate('customer', 'name avatar')
      .populate('barber', 'name avatar')
      .select('review date time')
      .sort({ 'review.createdAt': -1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews', error: error.message });
  }
};

// Add review (customer only)
export const addReview = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { rating, comment } = req.body;

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      customer: req.user.userId,
      status: 'completed'
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found or not completed' });
    }

    if (appointment.review) {
      return res.status(400).json({ message: 'Review already exists for this appointment' });
    }

    appointment.review = {
      rating,
      comment,
      createdAt: new Date()
    };

    await appointment.save();

    await appointment.populate([
      { path: 'customer', select: 'name avatar' },
      { path: 'barber', select: 'name avatar' }
    ]);

    res.json({
      message: 'Review added successfully',
      review: appointment.review
    });
  } catch (error) {
    res.status(500).json({ message: 'Error adding review', error: error.message });
  }
};

// Update review (customer only)
export const updateReview = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { rating, comment } = req.body;

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      customer: req.user.userId,
      'review': { $exists: true }
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Review not found' });
    }

    appointment.review = {
      rating,
      comment,
      updatedAt: new Date()
    };

    await appointment.save();

    await appointment.populate([
      { path: 'customer', select: 'name avatar' },
      { path: 'barber', select: 'name avatar' }
    ]);

    res.json({
      message: 'Review updated successfully',
      review: appointment.review
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating review', error: error.message });
  }
};

// Delete review (customer only)
export const deleteReview = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      customer: req.user.userId,
      'review': { $exists: true }
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Review not found' });
    }

    appointment.review = undefined;
    await appointment.save();
    
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting review', error: error.message });
  }
}; 