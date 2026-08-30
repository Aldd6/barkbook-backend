class ApiError extends Error {
    constructor(message, flag) {
        super(message);
        this.flag = flag;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

class HttpError extends Error {
    constructor(message, code) {
        super(message);
        this.code = code;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

const ERROR_MAP = {
    RESOURCE_NOT_FOUND: { statusCode: 404, defaultMessage: "Recurso no encontrada." },
    INVALID_INPUT: { statusCode: 400, defaultMessage: "Valor invalido, o campo faltante." },
    UNAUTHENTICATED: { statusCode: 401, defaultMessage: "No autenticado." },
    UNAUTHORIZED_ACCESS: { statusCode: 403, defaultMessage: "No autorizado." },
    RESOURCE_CONFLICT: { statusCode: 409, defaultMessage: "El valor ingresado ya existe o fue tomado." },
    RATE_LIMIT_EXCEEDED: { statusCode: 429, defaultMessage: "Demasiadas peticiones." },
    INTERNAL_ERROR: { statusCode: 500, defaultMessage: "Error interno del sistema." },
    DATABASE_ERROR: { statusCode: 500, defaultMessage: "Error de la base de datos."}
}

module.exports = { ApiError, HttpError, ERROR_MAP }