// controllers/products.ts

import { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import Product from '../models/product';
import ConflictError from '../errors/conflict-error';

export const getProducts = (_req: Request, res: Response, next: NextFunction) => {
  Product.find({})
    .then((products) => res.status(200).send({ items: products, total: products.length }))
    .catch(next);
};

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  const {
    title, image, category, description, price,
  } = req.body;
  try {
    await fs.promises.rename(
      path.join(__dirname, '../public/temp', path.basename(image.fileName)),
      path.join(__dirname, '../public/images', path.basename(image.fileName)),
    );
    const product = await Product.create({
      title, image, category, description, price,
    });
    res.status(201).send(product);
  } catch (error) {
    if (error instanceof Error && error.message.includes('E11000')) {
      next(new ConflictError('Товар с таким названием уже существует'));
      return;
    }
    next(error);
  }
};
