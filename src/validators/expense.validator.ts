import Joi from 'joi';

const createExpenseSchema = Joi.object({
  type: Joi.string().valid('transport', 'repas', 'hebergement', 'materiel', 'autre').required(),
  description: Joi.string().required(),
  amount: Joi.number().positive().required(),
  date: Joi.date().required(),
});

const rejectExpenseSchema = Joi.object({
  reason: Joi.string().required(),
});

export default {
  createExpenseSchema,
  rejectExpenseSchema,
};




