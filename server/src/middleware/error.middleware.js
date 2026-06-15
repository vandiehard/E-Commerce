const { error } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    const messages = err.errors.map((e) => e.message);
    return error(res, messages.join(', '), 400);
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    const messages = err.errors.map((e) => e.message);
    return error(res, messages.join(', '), 409);
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return error(res, 'Referenced record does not exist', 400);
  }

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return error(res, 'File size exceeds the limit', 400);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  return error(res, message, statusCode);
};

module.exports = errorHandler;
