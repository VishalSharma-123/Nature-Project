const Review = require(`${__dirname}/../models/reviewModel.js`);
const catchAsync = require('./../utils/catchAsync.js');

exports.getAllReviews = catchAsync(async (req, res, next) => {
  const review = await Review.find();

  res.status(200).json({
    status: 'ok',
    results: review.length,
    data: {
      review,
    },
  });
});

exports.createReview = catchAsync(async (req, res, next) => {
  const newReview = await Review.create(req.body);

  res.status(201).json({
    status: 'ok',
    data: {
      review: newReview,
    },
  });
});
