// app.ts

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import productsRouter from './routes/products';
import orderRouter from './routes/order';

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://127.0.0.1:27017/weblarek');

app.use(express.static(path.join(__dirname, 'public')));
app.use('/product', productsRouter);
app.use('/order', orderRouter);

app.listen(3000, () => {
  console.log('listening at port 3000');
});
