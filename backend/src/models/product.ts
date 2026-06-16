// models/product.ts

import { model, Schema } from 'mongoose';
import fs from 'fs';
import path from 'path';
import { logger } from '../middlewares/logger';

interface IProduct {
  title: string;
  image: {
    fileName: string,
    originalName: string;
  };
  category: string;
  description?: string;
  price: number | null;
}

const productSchema = new Schema<IProduct>({
  title: {
    type: String,
    unique: true,
    required: [true, 'Поле "title" должно быть заполнено'],
    minlength: [2, 'Минимальная длина поля "title" - 2'],
    maxlength: [30, 'Максимальная длина поля "title" - 30 символов'],
  },
  image: {
    fileName: {
      type: String,
      required: [true, 'Поле "fileName" должно быть заполнено'],
    },
    originalName: {
      type: String,
      required: [true, 'Поле "originalName" должно быть заполнено'],
    },
  },
  category: {
    type: String,
    required: [true, 'Должна быть выбрана хотя бы 1 категория'],
  },
  description: {
    type: String,
    required: false,
  },
  price: {
    type: Number,
    required: false,
    default: null,
  },
});

productSchema.post('deleteOne', (doc) => {
  fs.promises.unlink(path.join(__dirname, '../public', doc.image.fileName))
    .catch((err) => logger.error('Ошибка удаления файла', err));
});

export default model<IProduct>('product', productSchema);
