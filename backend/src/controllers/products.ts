// controllers/products.ts

import { NextFunction, Request, Response } from 'express';
import Product from '../models/product';
import ConflictError from '../errors/conflict-error';

export const getProducts = (_req: Request, res: Response, next: NextFunction) => {
  Product.find({})
    .then((products) => res.status(200).send({ items: products, total: products.length }))
    .catch(next);
};

export const createProduct = (req: Request, res: Response, next: NextFunction) => {
  const {
    title, image, category, description, price,
  } = req.body;
  Product.create({
    title, image, category, description, price,
  })
    .then((product) => res.status(201).send({ data: product }))
    .catch((error) => {
      if (error.message.includes('E11000')) {
        next(new ConflictError('Товар с таким названием уже существует'));
        return;
      }
      next(error);
    });
};
