const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const bcrypt = require('bcrypt');

// Get current user profile
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get Profile Error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Get all barbers
router.get('/barbers', async (req, res) => {
  try {
    const barbers = await User.find({ role: 'barber' }).select('-password');
    res.json(barbers);
  } catch (error) {
    console.error('Get Barbers Error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Update user profile
router.patch('/me', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'email', 'password', 'phone'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).json({ message: 'Geçersiz güncelleme alanları' });
  }

  try {
    updates.forEach(update => req.user[update] = req.body[update]);
    if (req.body.password) {
      req.user.password = await bcrypt.hash(req.body.password, 8);
    }
    await req.user.save();
    res.json(req.user);
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(400).json({ message: 'Profil güncellenirken bir hata oluştu' });
  }
});

module.exports = router; 