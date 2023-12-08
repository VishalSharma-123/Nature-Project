const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

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

const User = mongoose.model('User', userSchema);

module.exports = User;
