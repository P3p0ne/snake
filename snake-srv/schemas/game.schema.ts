import Joi from "joi";

export const GameSchema = Joi.object().keys({
   id: Joi.string(),
   userId: Joi.string().required(),
   timestamp: Joi.date(),
   score: Joi.number().min(1).required()
});


export interface Game {
    id: string;
    userId: string;
    timestamp: Date;
    score: number;
}
