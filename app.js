const express = require("express");
const fs = require("fs");
const morgan = require("morgan");

const app = express();

//Middleware
app.use(morgan("dev"));
app.use(express.json());

app.use((req, res, next) => {
  console.log("Hello from middleware");
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

//Data
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

//Route Handlers

const getAllTours = (req, res) => {
  console.log(req.requestTime);
  res.status(200).json({
    status: "Success",
    requesteAt: req.requestTime,
    results: tours.length,
    data: {
      tours: tours,
    },
  });
};

const getTour = (req, res) => {
  const id = req.params.id * 1;

  if (id >= tours.length) {
    return res.status(404).json({
      status: "Error",
      message: "Invalid tour id",
    });
  }

  const tour = tours.find((el) => el.id == id);

  res.status(200).json({
    status: "Success",
    data: {
      tour: tour,
    },
  });
};

const createTour = (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);

  tours.push(newTour);

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({
        status: "Success",
        data: {
          tour: newTour,
        },
      });
    }
  );
};

const updateTour = (req, res) => {
  const id = req.params.id * 1;

  if (id >= tours.length) {
    return res.status(404).json({
      status: "Error",
      message: "Invalid tour id",
    });
  }

  res.status(200).json({
    status: "Success",
    data: {
      tour: "Updated tours object successfully",
    },
  });
};

const deleteTour = (req, res) => {
  const id = req.params.id * 1;

  if (id >= tours.length) {
    return res.status(404).json({
      status: "Error",
      message: "Invalid tour id",
    });
  }

  res.status(204).json({
    status: "Success",
    data: null,
  });
};

const getAllUsers = (req, res) => {
  res.status(500).json({
    status: "Error",
    message: "This route is not yet created",
  });
};

const createUser = (req, res) => {
  res.status(500).json({
    status: "Error",
    message: "This route is not yet created",
  });
};

const getUser = (req, res) => {
  res.status(500).json({
    status: "Error",
    message: "This route is not yet created",
  });
};

const updateUser = (req, res) => {
  res.status(500).json({
    status: "Error",
    message: "This route is not yet created",
  });
};

const deleteUser = (req, res) => {
  res.status(500).json({
    status: "Error",
    message: "This route is not yet created",
  });
};

//Routes
app.route("/api/v1/tours/").get(getAllTours).post(createTour);

app
  .route("/api/v1/tours/:id")
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);

app.route("/api/v1/users").get(getAllUsers).post(createUser);

app
  .route("/api/v1/users/:id")
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);

  //Server starts here
const port = 3000;
app.listen(port, () => {
  console.log("App listening on port: 3000");
});
