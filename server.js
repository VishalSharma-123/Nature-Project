const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const app = require("./app");

console.log(process.env);

const port = 3000;
app.listen(port, () => {
  console.log("App listening on port: 3000");
});
