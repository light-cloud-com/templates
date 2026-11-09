export function notFound(req, res) {
  res.status(404).json({ error: "Not found" });
}

// Express 5 sends errors thrown in async handlers here. Four arguments is how
// Express recognises an error handler.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err.status >= 400 && err.status < 500) {
    return res.status(err.status).json({ error: "Invalid request body" });
  }
  console.error(err);
  res.status(500).json({ error: "Something went wrong" });
}
