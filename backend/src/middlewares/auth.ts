import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config';

export default (req: Request, res: Response, next: NextFunction) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).send({ message: 'Необходима авторизация' });
  }

  const token = authorization.replace('Bearer ', '');
  try {
    (req as any).user = jwt.verify(token, JWT_SECRET) as { _id: string };
  } catch (err) {
    return res.status(401).send({ message: 'Необходима авторизация' });
  }

  return next();
};
