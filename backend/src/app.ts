import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

const app = express();
app.use(cors());

mongoose.connect('mongodb://127.0.0.1:27017/weblarek');

app.listen(3000, () => {
  console.log('listening at port 3000');
});
