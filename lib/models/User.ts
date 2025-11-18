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

  // WAITLIST STATUS
waitlistStatus: {
  type: String,
  enum: ["none", "joined"],
  default: "none",
},

// WHEN USER JOINED THE WAITLIST
waitlistJoinedAt: {
  type: Date,
  default: null,
},

membershipEnabled: {
  type: Boolean,
  default: false,
},

  
  
  // --- ADD THIS LINE ---
  phone: { type: String },

  // ==========================================================
  // ✅ NEW FIELD FOR WAITLIST STATUS
  // This will allow you to mark users as on the waitlist
  // Useful for analytics, sorting, and unlocking access later.
  // ==========================================================
 
  // ==========================================================
  // ✅ OPTIONAL: Timestamp when user joined waitlist
  // This helps you prioritize "first come first served"
  // ==========================================================
  

}, { timestamps: true });



export default mongoose.models.User || mongoose.model('User', UserSchema);