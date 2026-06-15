// app.ts

import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import { errors } from 'celebrate';
import { DB_ADDRESS, PORT } from './config';
import errorHandler from './middlewares/error-handler';
import productsRouter from './routes/products';
import uploadRouter from './routes/upload';
import orderRouter from './routes/order';
import userRouter from './routes/auth';
import BadRequestError from './errors/bad-request-error';
import { requestLogger, errorLogger, logger } from './middlewares/logger';

const app = express();
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

mongoose.connect(DB_ADDRESS);

app.use(requestLogger);

app.use(express.static(path.join(__dirname, 'public')));
app.use('/auth', userRouter);
app.use('/product', productsRouter);
app.use('/upload', uploadRouter);
app.use('/order', orderRouter);

app.use('*', (_req, _res, next) => next(new BadRequestError('Маршрут не найден')));
app.use(errorLogger);
app.use(errors());
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info('listening at port 3000');
});
