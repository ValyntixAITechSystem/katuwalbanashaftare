import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const memberSchema = new mongoose.Schema({
  uuid: {
    type: String,
    default: uuidv4,
    unique: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  relation: {
    type: String,
    enum: ['member', 'spouse', 'child', 'parent', 'sibling', 'grandparent', 'grandchild', 'other'],
    default: 'member',
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true,
  },
  dob: Date,
  dod: Date,
  phone: {
    type: String,
    sparse: true,
    trim: true,
  },
  email: {
    type: String,
    sparse: true,
    trim: true,
    lowercase: true,
  },
  address: {
    type: String,
    trim: true,
  },
  occupation: {
    type: String,
    trim: true,
  },
  photo: {
    type: String,
    default: null,
  },
  notes: {
    type: String,
    trim: true,
  },
  isAlive: {
    type: Boolean,
    default: true,
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
memberSchema.index({ name: 'text' });
memberSchema.index({ phone: 1 });
memberSchema.index({ email: 1 });

export default mongoose.model('Member', memberSchema);