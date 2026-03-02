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

export default {
  createLeaveSchema,
  rejectLeaveSchema,
};




