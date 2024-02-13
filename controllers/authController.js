const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { response } = require('express');
const User = require(`${__dirname}/../models/userModels.js`);
const catchAsync = require(`${__dirname}/../utils/catchAsync.js`);
const AppError = require(`${__dirname}/../utils/appError.js`);
const sendEmail = require(`${__dirname}/../utils/email.js`);

const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV == 'production') {
    cookieOptions.secure = true;
  }

  res.cookie('jwt', token, cookieOptions);

  //Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'Success',
    token,
    data: {
      user: user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  createSendToken(newUser, 201, res);
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
  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  //Getting token and checking of it
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
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

//Only for rendered pages. No error.
exports.isLoggedIn = catchAsync(async (req, res, next) => {
  //Getting token and checking of it
  if (req.cookies.jwt) {
    //verification of token
    const decoded = await promisify(jwt.verify)(
      req.cookies.jwt,
      process.env.JWT_SECRET,
    );

    //check if user still exist
    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      return next();
    }
    //check if user changed the password after token was issued
    if (currentUser.changedPassowrdAfter(decoded.iat)) {
      return next();
    }

    //There is a logged in user
    res.locals.user = currentUser;
    next();
  }
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
  await user.save({ validateBeforeSave: false });

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

exports.resetPassword = catchAsync(async (req, res, next) => {
  //Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // if token is not expired and there is a user, set the new password
  if (!user) {
    return next(new AppError('Token isinvalid or has expired.', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetExpires = undefined;
  user.passwordResetToken = undefined;

  await user.save();

  //update changedPasswordAt property for the user

  //log the user in, send the JWT
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //Get user from the collection
  const user = await User.findById(req.user.id).select('+password');

  //check is posted current password is correct or not
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    next(
      new AppError(
        'Your current password is worng. Please enter the correct one',
        401,
      ),
    );
  }

  //if so update the password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  //log user in, send new JWT
  createSendToken(user, 200, res);
  const token = signToken(user._id);

  res.status(201).json({
    status: 'Success',
    token,
    data: {
      user: user,
    },
  });
});
