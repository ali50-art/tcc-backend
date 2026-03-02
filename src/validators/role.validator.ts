import Joi from 'joi';

const createRoleSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow(''),
  permissions: Joi.array().items(Joi.string()),
  isActive: Joi.boolean(),
});

const updateRoleSchema = Joi.object({
  name: Joi.string(),
  description: Joi.string().allow(''),
  permissions: Joi.array().items(Joi.string()),
  isActive: Joi.boolean(),
});

export default {
  createRoleSchema,
  updateRoleSchema,
};




