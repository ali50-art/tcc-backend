import Joi from 'joi';

const todoSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string(),
  isConpleted: Joi.boolean().required(),
});

export default { todoSchema };
