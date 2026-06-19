// controllers/products.ts

import { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import Product from '../models/product';
import ConflictError from '../errors/conflict-error';
import NotFoundError from '../errors/not-found-error';
import BadRequestError from '../errors/bad-request-error';

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
    path.join(__dirname, '../public/temp', path.basename(image.fileName)),
    path.join(__dirname, '../public/images', path.basename(image.fileName)),
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

  if (!mongoose.Types.ObjectId.isValid(id)) {
    next(new BadRequestError('Некорректный индентификатор товара'));
    return;
  }

  Product.findByIdAndDelete(id)
    .then((product) => {
      if (!product) {
        return next(new NotFoundError('Товар не найден'));
      }
      return res.status(200).send(product);
    })
    .catch(next);
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.productId;
  const {
    title, image, category, description, price,
  } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    next(new BadRequestError('Некорректный индентификатор товара'));
    return;
  }

  try {
    if (image) {
      await fs.promises.rename(
        path.join(__dirname, '../public/temp', path.basename(image.fileName)),
        path.join(__dirname, '../public/images', path.basename(image.fileName)),
      );
    }
    const product = await Product.findByIdAndUpdate(id, {
      title, image, category, description, price,
    }, { new: true });

    if (!product) {
      next(new NotFoundError('Товар не найден'));
      return;
    }

    res.status(200).send(product);
  } catch (error) {
    if (error instanceof Error && error.message.includes('E11000')) {
      next(new ConflictError('Товар с таким названием уже существует'));
      return;
    }
    next(error);
  }
};
