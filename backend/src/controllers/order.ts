import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import PAYMENT_METHODS from '../utils/constants';
import Product from '../models/product';

const postOrder = (req: Request, res: Response) => {
  const {
    payment, email, phone, address, total, items,
  } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    res.status(400).send({ message: 'Произошла ошибка' });
    return;
  }

  if (!payment || !email || !phone || !address || total === undefined) {
    res.status(400).send({ message: 'Произошла ошибка' });
    return;
  }

  if (typeof payment !== 'string' || !PAYMENT_METHODS.includes(payment)) {
    res.status(400).send({ message: 'Произошла ошибка' });
    return;
  }

  if (!items.every((item) => mongoose.Types.ObjectId.isValid(item))) {
    res.status(400).send({ message: 'Произошла ошибка' });
    return;
  }

  Product.find({ _id: { $in: items } })
    .then((products) => {
      if (items.length !== products.length) {
        res.status(400).send({ message: 'Произошла ошибка' });
        return;
      }

      if (products.some((product) => product.price === null)) {
        res.status(400).send({ message: 'Произошла ошибка' });
        return;
      }

      const totalPrice = products.reduce((sum, current) => sum + current.price!, 0);

      if (total !== totalPrice) {
        res.status(400).send({ message: 'Произошла ошибка' });
        return;
      }

      res.status(201).send({ id: faker.string.uuid(), total: totalPrice });
    })
    .catch(() => res.status(500).send({ message: 'Произошла ошибка' }));
};

export default postOrder;
