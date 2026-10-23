const AppError = require("../utils/AppError");

const errorMiddleware = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let details;

  if (err.name === "ZodError") {
    statusCode = 400;
    message = "Validation failed";
    details = err.issues?.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
  } else if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid resource ID";
  } else if (err.code === 11000) {
    statusCode = 409;
    message = "A record with this value already exists";
  }

  const response = {
    success: false,
    code: statusCode,
    status: err.status || "error",
    message,
  };

  if (details?.length) {
    response.details = details;
  }

  res.status(statusCode).json(response);
};

module.exports = errorMiddleware;