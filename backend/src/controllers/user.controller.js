import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';

// Get all barbers
export const getBarbers = async (req, res) => {
  try {
    const barbers = await User.find({ role: 'barber', isActive: true })
      .select('-password')
      .sort({ name: 1 });
    res.json(barbers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all users (admin only)
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user by ID (admin only)
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new user (admin only)
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, phone, isActive } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Bu e-posta adresi zaten kullanılıyor' });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      role,
      phone,
      isActive: isActive !== undefined ? isActive : true
    });

    await user.save();

    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json(userResponse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user (admin only)
export const updateUser = async (req, res) => {
  try {
    const { name, email, password, role, phone, isActive } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    // Check if email is being changed and if it's already in use
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Bu e-posta adresi zaten kullanılıyor' });
      }
    }

    // Update user fields
    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;
    user.phone = phone !== undefined ? phone : user.phone;
    user.isActive = isActive !== undefined ? isActive : user.isActive;

    // Update password if provided
    if (password) {
      user.password = password;
    }

    await user.save();

    // Return updated user without password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json(userResponse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete user (admin only)
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    await user.deleteOne();
    res.json({ message: 'Kullanıcı başarıyla silindi' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 