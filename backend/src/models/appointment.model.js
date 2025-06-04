import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  barberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  services: [{
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service'
    },
    quantity: {
      type: Number,
      default: 1
    }
  }],
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  photos: {
    before: [{
      url: String,
      description: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    after: [{
      url: String,
      description: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  note: {
    type: String,
    trim: true
  },
  review: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true,
  strict: false
});

// Index for efficient querying
appointmentSchema.index({ date: 1, time: 1, barberId: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment; 