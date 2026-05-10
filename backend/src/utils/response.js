export const sendError = (res, status, message, errors) => {
  return res.status(status).json({
    success: false,
    ...(message && { message }),
    ...(errors && { errors }),
  });
};

export const sendSuccess = (res, status, data, message) => {
  return res.status(status).json({
    success: true,
    ...(message && { message }),
    ...(data !== undefined && { data }),
  });
};
