// controllers/products.ts

import { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { UPLOAD_PATH, UPLOAD_PATH_TEMP } from '../config';
import Product from '../models/product';
import ConflictError from '../errors/conflict-error';
import NotFoundError from '../errors/not-found-error';
import { logger } from '../middlewares/logger';

export const getProducts = (_req: Request, res: Response, next: NextFunction) => {
  Product.find({})
    .then((products) => res.status(200).send({ items: products, total: products.length }))
    .catch(next);
};

export const createProduct = (req: Request, res: Response, next: NextFunction) => {
  const {
    title, image, category, description, price,
  } = req.body;

  const baseName = path.basename(image.fileName);
  const finalImage = { fileName: `/${UPLOAD_PATH}/${baseName}`, originalName: image.originalName };

  fs.promises.rename(
    path.join(__dirname, '../public', UPLOAD_PATH_TEMP, baseName),
    path.join(__dirname, '../public', UPLOAD_PATH, baseName),
  )
    .then(() => Product.create({
      title, image: finalImage, category, description, price,
    }))
    .then((product) => {
      res.status(201).send(product);
    })
    .catch((error) => {
      if (error instanceof Error && error.message.includes('E11000')) {
        next(new ConflictError('Товар с таким названием уже существует'));
        return;
      }
      next(error);
    });
};

export const deleteProduct = (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.productId;

  Product.findById(id)
    .then((product) => {
      if (!product) {
        throw new NotFoundError('Товар не найден');
      }
      return product.deleteOne().then(() => product);
    })
    .then((product) => res.status(200).send(product))
    .catch(next);
};

export const updateProduct = (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.productId;
  const {
    title, image, category, description, price,
  } = req.body;

  const baseName = image ? path.basename(image.fileName) : null;
  const finalImage = baseName
    ? { fileName: `/${UPLOAD_PATH}/${baseName}`, originalName: image.originalName }
    : image;

  Product.findById(id)
    .then((oldProduct) => {
      if (!oldProduct) {
        return next(new NotFoundError('Товар не найден'));
      }
      const oldImagePath = baseName
        ? path.join(__dirname, '../public', oldProduct.image.fileName)
        : null;

      const moveFile = baseName
        ? fs.promises.rename(
          path.join(__dirname, '../public', UPLOAD_PATH_TEMP, baseName),
          path.join(__dirname, '../public', UPLOAD_PATH, baseName),
        )
        : Promise.resolve();

      return moveFile
        .then(() => Product.findByIdAndUpdate(id, {
          title, image: finalImage, category, description, price,
        }, { new: true, runValidators: true }))
        .then((product) => {
          if (!product) {
            return next(new NotFoundError('Товар не найден'));
          }
          if (oldImagePath) {
            fs.promises.unlink(oldImagePath)
              .catch((err) => logger.error('Ошибка удаления старого файла', err));
          }
          return res.status(200).send(product);
        });
    })
    .catch((error) => {
      if (error instanceof Error && error.message.includes('E11000')) {
        next(new ConflictError('Товар с таким названием уже существует'));
        return;
      }
      next(error);
    });
};
