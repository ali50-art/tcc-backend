import logger from '../../utils/logger';

import mongoose from 'mongoose';

const connection = async () => {
  try {
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(process.env.MONGO_URI);
    logger.info(`MongoDB Database Connected with Host: ${conn.connection.host}`);
  } catch (error: any) {
    logger.error('Connection Error => ', error?.message || error);
    if (error) logger.error(error);
    process.exit(1);
  }
};

export default connection;
