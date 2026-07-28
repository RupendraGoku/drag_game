import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    passwordHash: {
      type: String,
      required: true,
      select: false
    },
    role: {
      type: String,
      enum: ['admin', 'superadmin'],
      default: 'admin'
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

adminSchema.methods.comparePassword = function comparePassword(password) {
  return bcrypt.compare(password, this.passwordHash);
};

export const Admin = mongoose.model('Admin', adminSchema);
