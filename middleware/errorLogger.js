const logger = require('../logger');

function errorLogger(err, req, res, next) {
  const traceId = req.traceId || 'n/a';

  logger.error('Unhandled error', {
    traceId,
    method: req.method,
    path: req.originalUrl,
    statusCode: res.statusCode || 500,
    message: err.message,
    stack: err.stack
  });

  res.status(500).json({ error: 'Internal server error', traceId });
}

module.exports = errorLogger;
