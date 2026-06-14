import { celebrate, Joi, Segments } from 'celebrate';

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

const validateProductBody = celebrate({
  [Segments.BODY]: productSchema,
});

export default validateProductBody;
