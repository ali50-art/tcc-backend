import Joi from 'joi';

const createLeaveSchema = Joi.object({
  type: Joi.string().valid('cp', 'rtt', 'maladie', 'sans_solde', 'autre').required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().min(Joi.ref('startDate')).required(),
  reason: Joi.string().allow(''),
});

const rejectLeaveSchema = Joi.object({
  reason: Joi.string().required(),
});

const approveLeaveSchema = Joi.object({
  message: Joi.string().allow('').optional(),
});

export default {
  createLeaveSchema,
  rejectLeaveSchema,
  approveLeaveSchema,
};




