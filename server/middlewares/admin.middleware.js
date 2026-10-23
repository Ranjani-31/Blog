const AppError = require("../utils/AppError");

const adminMiddleware = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return next(
      new AppError("Access denied. Admins only.", 403)
    );
  }

  next();
};

module.exports = adminMiddleware;