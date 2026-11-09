// Unmatched routes answer in JSON rather than Express's HTML error page, so a
// client parsing responses gets the same shape from every route.
function notFound(req, res) {
  res.status(404).json({ error: 'Not found' });
}

// Four arguments is how Express recognises an error handler.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const status = err.status >= 400 && err.status < 500 ? err.status : 500;
  if (status === 500) console.error(err);
  res.status(status).json({ error: status === 500 ? 'Internal server error' : err.message });
}

module.exports = { notFound, errorHandler };
