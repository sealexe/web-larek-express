// app.ts

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import { errors } from 'celebrate';
import errorHandler from './middlewares/error-handler';
import productsRouter from './routes/products';
import orderRouter from './routes/order';
import BadRequestError from './errors/bad-request-error';
import { requestLogger, errorLogger } from './middlewares/logger';

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://127.0.0.1:27017/weblarek');

app.use(requestLogger);

app.use(express.static(path.join(__dirname, 'public')));
app.use('/product', productsRouter);
app.use('/order', orderRouter);

app.use('*', (_req, _res, next) => next(new BadRequestError('Маршрут не найден')));
app.use(errorLogger);
app.use(errors());
app.use(errorHandler);

app.listen(3000, () => {
  console.log('listening at port 3000');
});
