const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter your name.'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email id.'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Enter a valid email id.'],
  },
  photo: {
    type: String,
  },
  role: {
    type: String,
    enum: ['admin', 'user', 'guide', 'lead-guide'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Enter a password.'],
    minlength: [8, 'Provide a password with minimum 8 characters.'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'User must confirm their password'],
    //This only works on save and create
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'Enter the correct password only.',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

//Instnce Method
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassowrd,
) {
  return await bcrypt.compare(candidatePassword, userPassowrd);
};

userSchema.methods.changedPassowrdAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    return JWTTimestamp < changedTimeStamp;
  }

  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
