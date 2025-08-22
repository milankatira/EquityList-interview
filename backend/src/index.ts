import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import winston from 'winston';

import authRoutes from './routes/authRoutes';
import projectRoutes from './routes/projectRoutes';
import taskRoutes from './routes/taskRoutes';
import userRoutes from './routes/userRoutes';
import { connectToDb } from './db/index';

dotenv.config();

const app = express();
const port = process.env.PORT || 7000;

// Configure Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    // You can add more transports here, e.g., file transport
    // new winston.transports.File({ filename: 'error.log', level: 'error' }),
    // new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// Set CORS origin to your frontend URL if you use credentials
app.use(cors({
  origin: 'http://localhost:3000', // Change to your frontend URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// Basic health check endpoint
app.get('/', (req, res) => {
  res.send('Hello from the backend!');
});

// Dedicated health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1', taskRoutes);
app.use('/api/v1/users', userRoutes);

// Connect to MongoDB first, then start server
connectToDb()
  .then(() => {
    logger.info('✅ Successfully connected to MongoDB'); // Use logger
    app.listen(port as any, '0.0.0.0', () => {
      logger.info(`✅ Server running on http://localhost:${port}`); // Use logger
    });
  })
  .catch((err) => {
    logger.error('❌ Failed to connect to MongoDB:', err); // Use logger
    process.exit(1); // Exit if DB connection fails
  });
