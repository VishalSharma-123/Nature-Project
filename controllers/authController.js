const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require(`${__dirname}/../models/userModels.js`);
const catchAsync = require(`${__dirname}/../utils/catchAsync.js`);
const AppError = require(`${__dirname}/../utils/appError.js`);
const sendEmail = require(`${__dirname}/../utils/email.js`);

const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'Success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new appError('Please enter the email or password', 400));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Please enter correct email or password', 401));
  }
  token = signToken(user._id);
  res.status(200).json({
    status: 'Success',
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  //Getting token and checking of it
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in. Please log in to get access.', 401),
    );
  }

  //verification of token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //check if user still exist
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(new AppError('The user for this token no longer exist', 401));
  }
  //check if user changed the password after token was issued
  if (currentUser.changedPassowrdAfter(decoded.iat)) {
    return next(
      new AppError(
        'Password has been changed for this user. Log in again',
        401,
      ),
    );
  }

  //Grant access to protected route
  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    //roles is an array
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this task', 403),
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //Get user thorugh posted mail
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('Please enter the correct email id', 404));
  }

  //Generate random reset token
  const resetToken = user.createPasswordResetToken();

  //Send it to users email
  const resetURL = `${req.protocol}://${req.get(
    'host',
  )}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forgot your password? Send a patch request with your 
  password and confirm password on the url: ${resetURL}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your reset password token (valid for 10 minutes)',
      message,
    });

    res.status(200).json({
      status: 'Success',
      message: 'Token sent to email.',
    });
  } catch (err) {
    (user.passwordResetToken = undefined),
      (user.passwordResetExpires = undefined);
    await user.save({ validateBeforeSave: false });
    console.log(err);

    return next(
      new AppError(
        'There was an error sending the email. Please try again later.',
      ),
      500,
    );
  }
});

exports.resetPassword = (req, res, next) => {};
