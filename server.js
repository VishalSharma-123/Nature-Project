const dotenv = require("dotenv");
dotenv.config({ path: `${__dirname}/config.env` });
const app = require(`${__dirname}/app.js`);

// creating the server
const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Listening at port ${port}.`);
});
