const dotenv = require('dotenv');
dotenv.config({ path: `${__dirname}/config.env` });

process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  process.exit(1);
});

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

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  process.exit(1);
});
