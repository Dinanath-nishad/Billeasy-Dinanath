import winston from 'winston';

// Create a Winston logger instance
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  transports: [
    new winston.transports.Console(),
    // You can add more transports like file, HTTP, etc. based on your needs
  ],
});

export default logger;
