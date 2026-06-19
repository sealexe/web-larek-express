// controllers/auth.ts

import {
  CookieOptions, NextFunction, Request, Response,
} from 'express';
import mongoose from 'mongoose';
import ms from 'ms';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import UnauthorizedError from '../errors/unauthorized-error';
import NotFoundError from '../errors/not-found-error';
import { AUTH_ACCESS_TOKEN_EXPIRY, AUTH_REFRESH_TOKEN_EXPIRY, JWT_SECRET } from '../config';
import User from '../models/user';
import ConflictError from '../errors/conflict-error';
import BadRequestError from '../errors/bad-request-error';

type UserDoc = Awaited<ReturnType<typeof User.findUserByCredentials>>;

const MAX_REFRESH_TOKENS = 5;

const issueTokens = (user: UserDoc, res: Response): Promise<string> => {
  const accessToken = jwt.sign(
    { _id: user._id },
    JWT_SECRET,
    { expiresIn: AUTH_ACCESS_TOKEN_EXPIRY as ms.StringValue },
  );
  const refreshToken = jwt.sign(
    { _id: user._id },
    JWT_SECRET,
    { expiresIn: AUTH_REFRESH_TOKEN_EXPIRY as ms.StringValue },
  );
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    maxAge: ms(AUTH_REFRESH_TOKEN_EXPIRY as ms.StringValue),
    path: '/',
  } as CookieOptions);
  user.tokens.push({ token: refreshToken });
  if (user.tokens.length > MAX_REFRESH_TOKENS) {
    user.tokens.splice(0, user.tokens.length - MAX_REFRESH_TOKENS);
  }
  return user.save().then(() => accessToken);
};

export const register = (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password } = req.body;
  return bcrypt.hash(password, 10)
    .then((hash: string) => User.create({ name, email, password: hash }))
    .then((user) => issueTokens(user, res).then((accessToken) => {
      res.status(201).send({
        user: { email: user.email, name: user.name },
        success: true,
        accessToken,
      });
    }))
    .catch((error) => {
      if (error.message.includes('E11000')) {
        next(new ConflictError('Пользователь с таким email уже существует'));
        return;
      }
      next(error);
    });
};

export const login = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => issueTokens(user, res).then((accessToken) => {
      res.status(200).send({
        user: { email: user.email, name: user.name },
        success: true,
        accessToken,
      });
    }))
    .catch(next);
};

export const logout = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.refreshToken;
  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET) as {_id: string};
  } catch (error) {
    next(new UnauthorizedError('Пользователь не авторизован'));
    return;
  }

  if (!mongoose.Types.ObjectId.isValid(payload._id)) {
    next(new BadRequestError('Некорректный идентификатор пользователя'));
    return;
  }

  User.findById(payload._id)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь не найден');
      }
      return user.updateOne(
        { $pull: { tokens: { token } } },
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
  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET) as { _id: string };
  } catch (error) {
    next(new UnauthorizedError('Пользователь не авторизован'));
    return;
  }
  if (!mongoose.Types.ObjectId.isValid(payload._id)) {
    next(new BadRequestError('Некорректный идентификатор пользователя'));
    return;
  }
  User.findById(payload._id).select('+tokens.token')
    .then((user) => {
      if (!user) {
        return next(new NotFoundError('Пользователь не найден'));
      }
      const tokenExists = user.tokens.some((t) => t.token === token);
      if (!tokenExists) {
        return next(new UnauthorizedError('Токен отозван'));
      }
      return issueTokens(user, res).then((accessToken) => {
        res.status(200).send({
          user: { email: user.email, name: user.name },
          success: true,
          accessToken,
        });
      });
    })
    .catch(next);
};

export const getCurrentUser = (req: Request, res: Response, next: NextFunction) => {
  const { _id } = (req as any).user;

  User.findById(_id)
    .then((user) => {
      if (!user) {
        return next(new NotFoundError('Пользователь не найден'));
      }
      return res.status(200).send({
        user: {
          name: user.name,
          email: user.email,
        },
        success: true,
      });
    })
    .catch(next);
};
