const jwt = require('jsonwebtoken');
const config = require('../config/auth.js');
const { ApiError } = require('../utils/errors.js');

const verifyToken = (req, res, next) => {
    let token = req.headers["x-access-token"] || req.headers["authorization"];
    if(token && token.startsWith("Bearer ")) token = token.slice(7);
    if(!token) return next(new ApiError('Acceso denegado. Token de sesion no proporcionado.', "UNAUTHENTICATED"));

    jwt.verify(token, config.accessSecret, (err, decoded) => {
        if(err) return next(new ApiError('No autorizado. Token de sesion invalido o vencido.', "UNAUTHENTICATED"));
        req.user = decoded;
        next();
    });
};

module.exports = verifyToken;