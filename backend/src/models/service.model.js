import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Hizmet adı zorunludur'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  duration: {
    type: Number,
    required: [true, 'Süre zorunludur'],
    min: [1, 'Süre en az 1 dakika olmalıdır']
  },
  price: {
    type: Number,
    required: [true, 'Fiyat zorunludur'],
    min: [0, 'Fiyat 0\'dan küçük olamaz']
  },
  barberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Berber ID zorunludur']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create index for faster queries
serviceSchema.index({ barberId: 1, name: 1 });

const Service = mongoose.model('Service', serviceSchema);

export default Service; 