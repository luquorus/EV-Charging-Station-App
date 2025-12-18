class AppError extends Error {
  constructor(code, message, statusCode = 400, details = []) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

function isAppError(err) {
  return err instanceof AppError;
}

module.exports = {
  AppError,
  isAppError,
};
