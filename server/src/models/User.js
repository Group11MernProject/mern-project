import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String },
    googleId: { type: String, sparse: true, unique: true },
    avatar: { type: String },
    isEmailVerified: { type: Boolean, default: false },
    verificationTokenHash: { type: String },
    verificationExpires: { type: Date }
  },
  { timestamps: true }
);

export const User = mongoose.model('User', userSchema);

