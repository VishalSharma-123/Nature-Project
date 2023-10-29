const dotenv = require('dotenv');
dotenv.config({ path: `${__dirname}/config.env` });
const app = require(`${__dirname}/app.js`);
const mongoose = require('mongoose');

const DATABASE = process.env.DB.replace('<PASSWORD>', process.env.DB_PASSWORD);
const port = process.env.PORT;

mongoose
  .connect(DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })

  .then(() => {
    console.log('DB connection successful!');
    app.listen(port, () => {
      console.log(`Listening at port ${port}.`);
    });
  });

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true,
  },
  rating: {
    type: Number,
    default: 4.5,
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price'],
  },
});
const Tour = mongoose.model('Tour', tourSchema);

const testTour = new Tour({
  name: 'The Forest Hiker',
  rating: 4.7,
  price: 397,
});

testTour
  .save()
  .then((doc) => {
    console.log(doc);
  })
  .catch((err) => {
    console.log('Error: ', err);
  });
// creating the server
