import Joi from "joi";

export const PagedResultQuerySchema= Joi.object().keys({
   limit: Joi.number().min(1).default(10),
   offset: Joi.number().min(0).default(0)
});
