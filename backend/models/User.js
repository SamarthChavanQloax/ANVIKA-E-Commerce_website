import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const addressSchema = mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  addressLine: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true, default: 'India' },
  isDefault: { type: Boolean, default: false },
}, {
  timestamps: true,
});

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  phone: { type: String },
  role: { type: String, required: true, enum: ['customer', 'admin'], default: 'customer' },
  avatar: { type: String, default: '' },
  gender: { type: String, enum: ['male', 'female', 'other', 'prefer-not-to-say', ''], default: '' },
  dateOfBirth: { type: Date },
  addresses: [addressSchema],
  wishlist: [{
    type: mongoose.Schema.Types.Mixed,
  }],
}, {
  timestamps: true,
  toJSON: {
    transform: function (doc, ret) {
      delete ret.password;
      return ret;
    },
  },
});

// Method to compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Middleware to hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
<<<<<<< HEAD
    return next();
=======
    return;
>>>>>>> origin/main
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);
export default User;
