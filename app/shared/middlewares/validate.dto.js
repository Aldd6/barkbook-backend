const z = require('zod');
const { HttpError, ERROR_MAP } = require('../utils/errors.js');

const validateDTO = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);
    if(!result.success) {
        const details = result.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
        }));
        const { statusCode, defaultMessage } = ERROR_MAP.INVALID_INPUT;
        const error = new HttpError(defaultMessage, statusCode);
        error.details = details;

        return next(error);
    }
    req.body = result.data;
    next();
};

module.exports = { validateDTO };