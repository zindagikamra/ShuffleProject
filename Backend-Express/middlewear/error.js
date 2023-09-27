module.exports = function sendError(res, statusCode, errorMessage) {
  return res.status(statusCode).json({
    error: errorMessage,
  });
};
