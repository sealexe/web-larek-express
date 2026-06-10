// controllers/products.ts

import { Request, Response } from 'express';
import Product from '../models/product';

export const getProducts = (_req: Request, res: Response) => {
  Product.find({})
    .then((products) => res.send({ items: products, total: products.length }))
    .catch(() => res.status(500).send({ message: 'Произошла ошибка' }));
};

export const createProduct = (req: Request, res: Response) => {
  const {
    title, image, category, description, price,
  } = req.body;
  Product.create({
    title, image, category, description, price,
  })
    .then((product) => res.send({ data: product }))
    .catch(() => res.status(500).send({ message: 'Произошла ошибка' }));
};
