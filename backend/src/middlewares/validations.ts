import { celebrate, Joi, Segments } from 'celebrate';
import PAYMENT_METHODS from '../utils/constants';

const productSchema = Joi.object({
  title: Joi.string().required().min(2).max(30),
  image: Joi.object({
    fileName: Joi.string().required(),
    originalName: Joi.string().required(),
  }),
  category: Joi.string().required(),
  description: Joi.string().allow(''),
  price: Joi.number().allow(null),
});

export const validateProductBody = celebrate({
  [Segments.BODY]: productSchema,
});

const registerSchema = Joi.object({
  name: Joi.string().required().min(2).max(30),
  email: Joi.string().required().email(),
  password: Joi.string().required().min(6),
});

const loginSchema = Joi.object({
  email: Joi.string().required().email(),
  password: Joi.string().required(),
});

const refreshTokenCookieSchema = Joi.object({
  refreshToken: Joi.string().required(),
}).unknown(true);

export const validateRegisterBody = celebrate({
  [Segments.BODY]: registerSchema,
});

export const validateLoginBody = celebrate({
  [Segments.BODY]: loginSchema,
});

export const validateRefreshTokenCookie = celebrate({
  [Segments.COOKIES]: refreshTokenCookieSchema,
});

const orderSchema = Joi.object({
  payment: Joi.string().valid(...PAYMENT_METHODS).required(),
  email: Joi.string().required().email(),
  phone: Joi.string().required(),
  address: Joi.string().required(),
  total: Joi.number().required(),
  items: Joi.array().items(Joi.string().hex().length(24)).min(1).required(),
});

export const validateOrderBody = celebrate({
  [Segments.BODY]: orderSchema,
});
