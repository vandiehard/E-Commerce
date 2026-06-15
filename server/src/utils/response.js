/**
 * Standardized API response helpers
 */

const success = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const created = (res, data = null, message = 'Created successfully') => {
  return success(res, data, message, 201);
};

const error = (res, message = 'Internal Server Error', statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};

const paginate = (res, { rows, count, page, limit }) => {
  const totalPages = Math.ceil(count / limit);
  return res.status(200).json({
    success: true,
    message: 'Success',
    data: rows,
    pagination: {
      totalItems: count,
      totalPages,
      currentPage: page,
      limit,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  });
};

module.exports = { success, created, error, paginate };
