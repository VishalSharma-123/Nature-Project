const fs = require("fs");

// Reading the data
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`, "utf-8")
);

//Param Middleware
exports.checkID = (req, res, next, val) => {
  console.log(`Value of id is: ${val}`);
  if (req.params.id > tours.length) {
    return res.status(404).json({
      status: "Failed",
      message: "No element with the given id was found.",
    });
  }
  next();
};

exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: "Failed",
      message: "Name or price not in the request",
    });
  }
  next();
};

//Router Handlers
exports.getAllTours = (req, res) => {
  res.status(200).json({
    status: "success",
    results: tours.length,
    data: {
      tours,
    },
  });
};

exports.getTour = (req, res) => {
  const id = req.params.id * 1;
  const tour = tours.find((el) => el.id === id);

  res.status(200).json({
    status: "Success",
    results: tour.length,
    data: {
      tour,
    },
  });
};

exports.createTour = (req, res) => {
  const newID = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newID }, req.body);
  tours.push(newTour);
  fs.writeFile(
    `${__dirname}\dev-data\data\tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({
        status: "success",
        data: {
          tour: newTour,
        },
      });
    }
  );
};

exports.updateTour = (req, res) => {
  res.status(200).json({
    status: "Updated",
    messgae:
      "The tour with the given id was updated. For testing purpose only.",
  });
};

exports.deleteTour = (req, res) => {
  res.status(204).json({
    status: "Deleted",
    messgae:
      "The tour with the given id was deleted. For testing purpose only.",
    data: null,
  });
};
