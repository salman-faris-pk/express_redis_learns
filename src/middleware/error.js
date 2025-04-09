import logger from "../utils/logger.js"


const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);

  const response = {
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
  };

  logger.error(`${statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);

  res.json(response);
};

export {
  notFound,
  errorHandler
};