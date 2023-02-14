import * as Joi from 'joi';

/* createUser validation */
export const createUserSchema = Joi.object({
  userMeta: Joi.object({}).required()
});
