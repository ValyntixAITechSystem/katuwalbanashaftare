import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    trim: true,
  },
  logo: {
    type: String,
    default: null,
  },
  mission: {
    type: String,
    trim: true,
  },
  vision: {
    type: String,
    trim: true,
  },
  address: {
    type: String,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
  },
  website: {
    type: String,
    trim: true,
  },
  registrationNumber: {
    type: String,
    trim: true,
  },
  establishedDate: Date,
  socialMedia: {
    facebook: String,
    twitter: String,
    instagram: String,
    youtube: String,
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

export default mongoose.model('Organization', organizationSchema);