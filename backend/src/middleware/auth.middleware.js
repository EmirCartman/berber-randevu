import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export const protect = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Yetkilendirme başarısız: Token bulunamadı' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'Yetkilendirme başarısız: Kullanıcı bulunamadı' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Yetkilendirme başarısız: Hesap aktif değil' });
    }

    req.user = {
      userId: user._id,
      role: user.role
    };
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Yetkilendirme başarısız: Geçersiz token' });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'Bu işlem için yetkiniz yok'
      });
    }
    next();
  };
}; 