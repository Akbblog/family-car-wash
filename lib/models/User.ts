import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
  },
  image: {
    type: String,
  },
  authProvider: {
    type: String,
    default: 'credentials',
  },
  isSubscribed: {
    type: Boolean,
    default: false,
  },
  stripeCustomerId: {
    type: String,
    unique: true,
    sparse: true, // Allows multiple null values
  },
  // --- SERVICE DETAILS ---
  address: { type: String },
  city: { type: String },
  zip: { type: String },
  notes: { type: String },
  preferredDay1: { type: String },
  preferredTime1: { type: String },
  preferredDay2: { type: String },
  preferredTime2: { type: String },
  
  
  // --- ADD THIS LINE ---
  phone: { type: String },

}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);