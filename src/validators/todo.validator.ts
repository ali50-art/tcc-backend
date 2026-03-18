import Joi from 'joi';

const todoSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string(),
  slug: Joi.string().valid('urgent', 'normal').optional(),
  dueDate: Joi.date().iso().optional(),
  isConpleted: Joi.boolean().optional(),
});

export default { todoSchema };
