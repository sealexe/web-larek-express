import { NextFunction, Request, Response } from 'express';
import { faker } from '@faker-js/faker';
import Product from '../models/product';
import BadRequestError from '../errors/bad-request-error';

const postOrder = (req: Request, res: Response, next: NextFunction) => {
  const {
    total, items,
  } = req.body;

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
