import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import PAYMENT_METHODS from '../utils/constants';
import Product from '../models/product';
import BadRequestError from '../errors/bad-request-error';

const postOrder = (req: Request, res: Response, next: NextFunction) => {
  const {
    payment, email, phone, address, total, items,
  } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    next(new BadRequestError('Список товаров пустой или не является массивом'));
    return;
  }

  if (!payment || !email || !phone || !address || total === undefined) {
    next(new BadRequestError('Не заполнены обязательные поля заказа'));
    return;
  }

  if (typeof payment !== 'string' || !PAYMENT_METHODS.includes(payment)) {
    next(new BadRequestError('Недопустимый способ оплаты'));
    return;
  }

  if (!items.every((item) => mongoose.Types.ObjectId.isValid(item))) {
    next(new BadRequestError('Некорректный идентификатор товара'));
    return;
  }

  Product.find({ _id: { $in: items } })
    .then((products) => {
      if (items.length !== products.length) {
        return next(new BadRequestError('Один или несколько товаров не найдены'));
      }

      if (products.some((product) => product.price === null)) {
        return next(new BadRequestError('Один или несколько товаров недоступны для покупки'));
      }

      const totalPrice = products.reduce((sum, current) => sum + current.price!, 0);

      if (total !== totalPrice) {
        return next(new BadRequestError('Итоговая сумма заказа не совпадает'));
      }

      return res.status(201).send({ id: faker.string.uuid(), total: totalPrice });
    })
    .catch(next);
};

export default postOrder;
