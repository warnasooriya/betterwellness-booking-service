const { v4: uuidv4 } = require('uuid');
const logger = require('../logger');

function requestLogger(req, res, next) {

    if (req.method === 'OPTIONS') return next(); // Skip logging for OPTIONS
    
  const traceId = uuidv4();
  const start = Date.now();

  req.traceId = traceId;

  logger.info('Request received', {
    traceId,
    method: req.method,
    path: req.originalUrl,
    userAgent: req.get('User-Agent') || '',
    userId: req.user?.username || 'anonymous'
  });

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('Request completed', {
      traceId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: duration,
      userId: req.user?.username || 'anonymous'
    });
  });

  next();
}

module.exports = requestLogger;
