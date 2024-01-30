const catchAsync = require(`${__dirname}/../utils/catchAsync.js`);
const AppError = require(`${__dirname}/../utils/appError.js`);
const APIFeatures = require(`${__dirname}/../utils/apiFeatures.js`);

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndDelete(req.params.id);

    if (!document) {
      return next(new AppError('document ID not found', 404));
    }

    res.status(204).json({
      status: 'Deleted',
      data: null,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!document) {
      return next(new AppError('document ID not found', 404));
    }

    res.status(200).json({
      status: 'Updated',
      data: {
        document,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const document = await Model.create(req.body);
    res.status(201).json({
      status: 'Success',
      data: {
        data: document,
      },
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query.populate(popOptions);
    const document = await query;
    console.log(req.params.id);

    if (!document) {
      return next(new AppError('document ID not found', 404));
    }

    res.status(200).json({
      status: 'Success',
      results: document.length,
      data: {
        document,
      },
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    //To allow for nested GET reviews
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    //Executing the Query
    const features = new APIFeatures(Model.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const document = await features.query;

    //Send the Response
    res.status(200).json({
      status: 'success',
      results: document.length,
      data: {
        document,
      },
    });
  });
