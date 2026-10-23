const asyncHandler = (controller) => (req, res, next) =>
  Promise.resolve()
    .then(() => controller(req, res, next))
    .catch(next);

module.exports = asyncHandler;
