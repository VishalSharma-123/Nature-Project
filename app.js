//Importing the modules
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError.js');
const globalErrorHandler = require('./controllers/errorController.js');
const tourRouter = require('./routes/tourRoutes.js');
const userRouter = require('./routes/userRoutes.js');
const reviewRouter = require('./routes/reviewRoutes.js');

//MIDDLEWARES

//Set security HTTP headers
const app = express();
app.use(helmet());

//Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//Limit requests from same IP address.
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message:
    'too many requests from this IP address. Please try again in an hour.',
});

app.use('/api', limiter);

//Body Parser. reading data from body to req.body
app.use(express.json({ limit: '10kb' }));

//Data sanitization to prevent NoSQL injection
app.use(mongoSanitize());

//Data sanitization to prevent xss (cross site scripting)
app.use(xss());

//Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'price',
    ],
  }),
);

//Serving static files
app.use(express.static(`${__dirname}/public`));

//CREATING ALL THE ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  next(
    new AppError(`Cant find the ${req.originalUrl} url in the server.`, 404),
  );
});

app.use(globalErrorHandler);

module.exports = app;
