import User from '../models/user.model.js';

// Get all barbers (public)
export const getBarbers = async (req, res) => {
  try {
    const barbers = await User.find({ role: 'barber', isActive: true })
      .select('-password')
      .sort({ name: 1 });
    res.json(barbers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching barbers', error: error.message });
  }
};

// Get barber by ID (public)
export const getBarberById = async (req, res) => {
  try {
    const barber = await User.findOne({ 
      _id: req.params.id, 
      role: 'barber', 
      isActive: true 
    }).select('-password');
    
    if (!barber) {
      return res.status(404).json({ message: 'Barber not found' });
    }
    
    res.json(barber);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching barber', error: error.message });
  }
};

// Update barber profile (barber only)
export const updateBarberProfile = async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'email', 'phone', 'avatar'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).json({ message: 'Invalid updates' });
  }

  try {
    updates.forEach(update => req.user[update] = req.body[update]);
    await req.user.save();
    
    res.json({ 
      message: 'Profile updated successfully',
      user: { ...req.user.toJSON(), password: undefined }
    });
  } catch (error) {
    res.status(400).json({ message: 'Error updating profile', error: error.message });
  }
}; 