// controllers/products.ts

import { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { UPLOAD_PATH, UPLOAD_PATH_TEMP } from '../config';
import Product from '../models/product';
import ConflictError from '../errors/conflict-error';
import NotFoundError from '../errors/not-found-error';

export const getProducts = (_req: Request, res: Response, next: NextFunction) => {
  Product.find({})
    .then((products) => res.status(200).send({ items: products, total: products.length }))
    .catch(next);
};

export const createProduct = (req: Request, res: Response, next: NextFunction) => {
  const {
    title, image, category, description, price,
  } = req.body;

  fs.promises.rename(
    path.join(__dirname, '../public', UPLOAD_PATH_TEMP, path.basename(image.fileName)),
    path.join(__dirname, '../public', UPLOAD_PATH, path.basename(image.fileName)),
  )
    .then(() => Product.create({
      title, image, category, description, price,
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
        next(new NotFoundError('Товар не найден'));
        return;
      }
      product.deleteOne().then(() => res.status(200).send(product));
    })
    .catch(next);
};

export const updateProduct = (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.productId;
  const {
    title, image, category, description, price,
  } = req.body;

  const moveFile = image
    ? fs.promises.rename(
      path.join(__dirname, '../public', UPLOAD_PATH_TEMP, path.basename(image.fileName)),
      path.join(__dirname, '../public', UPLOAD_PATH, path.basename(image.fileName)),
    )
    : Promise.resolve();

  moveFile
    .then(() => Product.findByIdAndUpdate(id, {
      title, image, category, description, price,
    }, { new: true, runValidators: true }))
    .then((product) => {
      if (!product) {
        next(new NotFoundError('Товар не найден'));
        return;
      }
      res.status(200).send(product);
    })
    .catch((error) => {
      if (error instanceof Error && error.message.includes('E11000')) {
        next(new ConflictError('Товар с таким названием уже существует'));
        return;
      }
      next(error);
    });
};
