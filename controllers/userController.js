const User = require('./../models/userModels.js');
const catchAsync = require('./../utils/catchAsync.js');
const AppError = require('./../utils/appError.js');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

//ROUTE HANDLERS
exports.getAllUsers = (req, res) => {
  res.status(500).json({
    status: 'Error',
    message: 'Not yet defined',
  });
};

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'Error',
    message: 'Not yet defined',
  });
};

exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'Error',
    message: 'Not yet defined',
  });
};

exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'Error',
    message: 'Not yet defined',
  });
};

exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'Error',
    message: 'Not yet defined',
  });
};

exports.updateMe = catchAsync(async (req, res, next) => {
  //error if treis to change password
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('You cannot change your password here', 400));
  }

  //update user data
  const filteredBody = filterObj(req.body, 'name', 'email');
  const updateUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'OK',
    data: {
      user: updateUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'Set to deactive',
    data: null,
  });
});
