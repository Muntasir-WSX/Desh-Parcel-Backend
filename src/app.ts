import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { AuthRoutes } from './app/modules/auth.route';

const app: Application =express();

// Security Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later after 15 minutes",
  },
});
app.use('/api/', limiter);

// Test Route
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Welcome to DeshParcel Backend API ",
    data: {
      version: "1.0.0",
      status: "Active"
    }
  });
});

app.use('/api/v1/auth', AuthRoutes);

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "API Endpoint Not Found",
    errors: [
      {
        path: req.originalUrl,
        message: "The requested route does not exist on this server."
      }
    ]
  });
});

export default app;
