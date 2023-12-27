const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./userModels');
const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A Tour name must have a max length of 40.'],
      minlength: [10, 'A Tour name must have a min length of 10.'],
      // validate: [validator.isAlpha, 'name must contains only letters.'],
    },
    slug: String,
    duration: {
      type: String,
      required: [true, 'A tour duration is required. '],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have minimum group size.'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty level.'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty must be easy, medium or difficult.',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be greater than or equal to 1'],
      max: [5, 'Rating must be less than or equal to 5'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (va) {
          return val < this.price;
        },
        message: 'Discount Price must be lower than actual price.',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour summary is required.'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour image is required.'],
    },
    images: [String],
    createdAt: {
      type: Date,
      defauls: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      //GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

//Document middleware. save() being called when event create or save happens
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

//Embedding example
// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

//Query middleware. find()
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took: ${Date.now() - this.start}`);
  next();
});

//Aggregate Middleware

tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
