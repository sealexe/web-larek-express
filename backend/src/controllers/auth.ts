// controllers/auth.ts

import {
  CookieOptions, NextFunction, Request, Response,
} from 'express';
import mongoose from 'mongoose';
import ms from 'ms';
import bcrypt from 'bcrypt';
import jwt, { TokenExpiredError } from 'jsonwebtoken';
import UnauthorizedError from 'errors/unauthorized-error';
import NotFoundError from '../errors/not-found-error';
import { AUTH_ACCESS_TOKEN_EXPIRY, AUTH_REFRESH_TOKEN_EXPIRY, JWT_SECRET } from '../config';
import User from '../models/user';
import ConflictError from '../errors/conflict-error';
import BadRequestError from '../errors/bad-request-error';

export const register = (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return next(new BadRequestError('Поля заполнены не верно'));
  }
  return bcrypt.hash(password, 10)
    .then((hash: string) => User.create({
      name,
      email,
      password: hash,
    }))
    .then((user) => {
      const accessToken = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: AUTH_ACCESS_TOKEN_EXPIRY as ms.StringValue || '10m' });
      const refreshToken = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: AUTH_REFRESH_TOKEN_EXPIRY as ms.StringValue || '7d' });
      res.cookie(
        'refreshToken',
        refreshToken,
        {
          httpOnly: true,
          sameSite: 'lax',
          secure: false,
          maxAge: ms(AUTH_REFRESH_TOKEN_EXPIRY as ms.StringValue),
          path: '/',
        } as CookieOptions,
      );
      user.tokens.push({ token: refreshToken });
      return user.save()
        .then(() => {
          res.status(201).send({
            user: {
              email,
              name,
            },
            success: true,
            accessToken,
          });
        });
    })
    .catch((error) => {
      if (error.message.includes('E11000')) {
        next(new ConflictError('Пользователь с таким email уже сущетсвует'));
        return;
      }
      next(error);
    });
};

export const login = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const accessToken = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: AUTH_ACCESS_TOKEN_EXPIRY as ms.StringValue || '10m' });
      const refreshToken = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: AUTH_REFRESH_TOKEN_EXPIRY as ms.StringValue || '7d' });
      res.cookie(
        'refreshToken',
        refreshToken,
        {
          httpOnly: true,
          sameSite: 'lax',
          secure: false,
          maxAge: ms(AUTH_REFRESH_TOKEN_EXPIRY as ms.StringValue),
          path: '/',
        } as CookieOptions,
      );
      user.tokens.push({ token: refreshToken });
      return user.save()
        .then(() => {
          res.status(200).send({
            user: {
              email: user.email,
              name: user.name,
            },
            success: true,
            accessToken,
          });
        });
    })
    .catch(next);
};

export const logout = (req: Request, res: Response, next: NextFunction) => {
  const cookie = req.cookies.refreshToken;
  const payload = jwt.verify(cookie, JWT_SECRET) as {_id: string};
  if (!mongoose.Types.ObjectId.isValid(payload._id)) {
    next(new BadRequestError('Некорректный индентификатор пользователя'));
    return;
  }
  User.findById(payload._id)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь не найден');
      }
      return user.updateOne(
        { $pull: { tokens: { token: cookie } } },
      );
    })
    .then(() => {
      res.clearCookie('refreshToken');
      res.status(200).send({ success: true });
    })
    .catch(next);
};

export const refreshAccessToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.refreshToken;
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { _id: string };
    if (!mongoose.Types.ObjectId.isValid(payload._id)) {
      return next(new BadRequestError('Некорректный индентификатор пользователя'));
    }
    User.findById(payload._id)
      .then((user) => {
        if (!user) {
          return next(new NotFoundError('Пользователь не найден'));
        }
        const accessToken = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: AUTH_ACCESS_TOKEN_EXPIRY as ms.StringValue || '10m' });
        const refreshToken = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: AUTH_REFRESH_TOKEN_EXPIRY as ms.StringValue || '7d' });
        res.cookie(
          'refreshToken',
          refreshToken,
        {
          httpOnly: true,
          sameSite: 'lax',
          secure: false,
          maxAge: ms(AUTH_REFRESH_TOKEN_EXPIRY as ms.StringValue),
          path: '/',
        } as CookieOptions,
        );
        user.tokens.push({ token: refreshToken });
        return user.save()
          .then(() => {
            res.status(201).send({
              user: {
                email,
                name,
              },
              success: true,
              accessToken,
            });
          });
      });
  } catch (error) {
    next(new UnauthorizedError('Пользователь не авторизован'));
  }
};

// export const refreshAccessToken = (req: Request, res: Response, next: NextFunction) => {
//   const token = req.cookies.refreshToken;
//   try {
//     const payload = jwt.verify(token, JWT_SECRET) as { _id: string };
//     if (!mongoose.Types.ObjectId.isValid(payload._id)) {
//       return next(new BadRequestError('Некорректный индентификатор пользователя'));
//     }
//     User.findById(payload._id)
//       .then((user) => {
//         if (!user) {
//           return next(new NotFoundError('Пользователь не найден'));
//         }

//       });
//   } catch (error) {
//     next(new UnauthorizedError('Пользователь не авторизован'));
//   }
// };
