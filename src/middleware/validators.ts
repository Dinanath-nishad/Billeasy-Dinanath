import { Request, Response, NextFunction } from 'express';
import Joi from 'joi'
import rateLimit from 'express-rate-limit';
import { IUser } from '../models/userSchema';

export const validateUserData = (req: Request, res: Response, next: NextFunction) => {
    const userSchema = Joi.object<IUser>({
        first_name: Joi.string().alphanum().min(3).max(30).required(),
        last_name: Joi.string().min(3).max(30).required(),

        password: Joi.string(),
        email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'io'] } }),
        // repeat_password: Joi.ref('password'),
        // access_token: [
        //    Joi.string(),
        //    Joi.number()
        // ],

        age: Joi.number().integer().min(18).max(55),
        address: Joi.string().alphanum().min(3).max(30).required(),
    })
    const valid = userSchema.validate(req.body);
    if (valid?.error) {
        return res.status(403).json({ error: valid?.error })
    } else {
        return next()
    }
}



export const rateLimiter = rateLimit({
    windowMs: 2 * 60 * 1000, // 1 hour window
    max: 2, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after an hour',
    headers: true,
});







