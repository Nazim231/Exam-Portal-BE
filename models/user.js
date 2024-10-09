import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    match: [/.+\@.+\..+/, 'Please fill a valid email address']
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['Faculty', 'Student'],
    default: 'Faculty'
  },
  otp: {
    type: Number,
    required: true,
    minlength: 6,
  },
  otpExpiresAt: {
    type: Date,
    required: true
  }
}, { timestamps: true });


const User = model('users', userSchema);

export default User;
