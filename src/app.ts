import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { AuthRoutes } from './app/modules/Auth/auth.route';
import { UserRoutes } from './app/modules/User/user.route';
import { ParcelRoutes } from './app/modules/Percel/percel.route';
import { AdminRoutes } from './app/modules/Admin/admin.route';
import { RiderRoutes } from './app/modules/Rider/rider.route';
import { PaymentRoutes } from './app/modules/payments/payment.route';

const app: Application = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later after 15 minutes',
  },
});

app.use('/api/', limiter);

app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to DeshParcel Backend API',
    data: {
      version: '1.0.0',
      status: 'Active',
    },
  });
});

app.use('/api/v1/auth', AuthRoutes);
app.use('/api/v1/users', UserRoutes);
app.use('/api/v1/parcels', ParcelRoutes);
app.use('/api/v1/admin', AdminRoutes);
app.use('/api/v1/rider',RiderRoutes);
app.use('/api/v1/payments', PaymentRoutes);


app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'API Endpoint Not Found',
    errors: [
      {
        path: req.originalUrl,
        message: 'The requested route does not exist on this server.',
      },
    ],
  });
});

export default app;
