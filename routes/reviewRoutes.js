const express = require('express');
const reviewController = require(
  `${__dirname}/../controllers/reviewController.js`,
);
const authController = require(`${__dirname}/../controllers/authController.js`);

//Creating the Routes
const router = express.Router();

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.createReview,
  );

module.exports = router;
