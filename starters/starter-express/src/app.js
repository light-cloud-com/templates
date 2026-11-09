const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/errors');

// The app is built here and started in server.js, so tests can use it
// without opening a port.
const app = express();

app.use(cors());
app.use(express.json());
app.use(routes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
