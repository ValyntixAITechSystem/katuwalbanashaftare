import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const donationSchema = new mongoose.Schema({
  uuid: {
    type: String,
    default: uuidv4,
    unique: true,
  },
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true,
    index: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  currency: {
    type: String,
    default: 'NPR',
  },
  purpose: {
    type: String,
    enum: ['general', 'education', 'medical', 'emergency', 'event', 'other'],
    default: 'general',
  },
  description: {
    type: String,
    trim: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  receipt: {
    type: String,
    default: null,
  },
  isAnonymous: {
    type: Boolean,
    default: false,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
}, {
  timestamps: true,
});

// Indexes for performance
donationSchema.index({ donor: 1, date: -1 });
donationSchema.index({ date: -1 });
donationSchema.index({ amount: 1 });

export default mongoose.model('Donation', donationSchema);