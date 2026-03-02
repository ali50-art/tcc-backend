import app from './app';
import logger from './utils/logger';
import connection from './database/mongodb/config';

// Handle Uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  logger.error(`ERROR: ${err.message}`);
  logger.error('Shutting down due to Uncaught Exception');
  process.exit(1);
});

// Connect database
connection();

// Start server
const port: number = Number(process.env.PORT) || 5000;
const server = app.listen(port, () => {
  logger.info(`Server started on port ${port} in ${process.env.NODE_ENV} mode.`);
});

// Handle Unhandled Promise rejection.
process.on('unhandledRejection', (err: Error) => {
  logger.error(`ERROR: ${err.message}`);
  logger.error('Shutting down the server due to Unhandled Promise rejection');
  server.close(() => {
    process.exit(1);
  });
});
