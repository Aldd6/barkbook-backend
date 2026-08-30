const { HttpError, ApiError, ERROR_MAP } = require('../utils/errors.js');

export function errorHandler(err, req, res, next) {
    console.log(`[ERROR]: ${err.stack || err.message}`);

    if(err instanceof ApiError) {
        const translate = ERROR_MAP[err.flag];
        const statusCode = translate ? translate.statusCode : 500;
        const message = err.message || (translate ? translate.defaultMessage : "Error interno del servidor.");

        return res.status(statusCode).json({
            success: false,
            status: statusCode,
            flag: err.flag,
            message: message
        });
    }

    if(err instanceof HttpError) {
        return res.status(err.code).json({
            success: false,
            status: err.code,
            message: err.message
        });
    }

    const isDevelopment = process.env.NODE_ENV === 'development';

    return res.status(500).json({
        success: false,
        status: 500,
        message: 'Internal Server Error',
        ...(isDevelopment && { stack: err.stack })
    });
}