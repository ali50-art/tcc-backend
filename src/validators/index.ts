import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { HttpCode } from '../utils/httpCode';

export default (schema: Joi.ObjectSchema) => (req: Request, res: Response, next: NextFunction) => {
  try {
    const { error } = schema.validate(req?.body, { abortEarly: false });
    if (!error) return next();

    let errors: any = {};

    const { details } = error;
    details.forEach((err) => {
      errors[err?.path[0]] = err?.message.replace(/['"]+/g, '');
    });

    return res.status(HttpCode.UNPROCESSABLE_ENTITY).json({
      errors,
    });
  } catch (error) {
    next(error);
  }
};
