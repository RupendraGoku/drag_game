import mongoose from 'mongoose';

const refreshTokenSchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
      index: true
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }
    },
    revokedAt: {
      type: Date,
      default: null
    },
    userAgent: String,
    ip: String
  },
  { timestamps: true }
);

refreshTokenSchema.index({ admin: 1, revokedAt: 1 });

export const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);
