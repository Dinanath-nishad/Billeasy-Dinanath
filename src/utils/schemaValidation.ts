import Joi from 'joi';

export const userValidationSchema = Joi.object({
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(30).required()
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,30}$'))
        .message('Password must be between 8 and 30 characters long and contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character.'),
    confirm_password: Joi.any().valid(Joi.ref('password'))
        .required()
        .label('Confirm password')
        .messages({ 'any.only': '{{#label}} does not match the password' }),
    // address: Joi.string(),
    // age: Joi.number().integer()
})

export const loginValidationSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});
