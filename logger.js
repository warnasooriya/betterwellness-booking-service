const { createLogger, format, transports } = require('winston');
const path = require('path');

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  transports: [
    new transports.Console(), // for terminal
    new transports.File({ filename: path.join(__dirname, 'logs/app.log') }) // for file output
  ]
});

module.exports = logger;
