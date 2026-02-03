import { Module, Logger } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const logger = new Logger('DatabaseModule');
        const uri = configService.get<string>('MONGODB_URI');

        if (!uri) {
          logger.error('MONGODB_URI is not defined in environment variables');
          throw new Error('MONGODB_URI is required');
        }

        logger.log('Connecting to MongoDB Atlas...');

        return {
          uri,
          retryAttempts: 3,
          retryDelay: 1000,
          connectionFactory: (connection) => {
            connection.on('connected', () => {
              logger.log('MongoDB Atlas connected successfully');
            });

            connection.on('error', (error: Error) => {
              logger.error('MongoDB connection error:', error);
            });

            connection.on('disconnected', () => {
              logger.warn('MongoDB disconnected');
            });

            return connection;
          },
        };
      },
    }),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
