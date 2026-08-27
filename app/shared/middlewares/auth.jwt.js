const jwt = require('jsonwebtoken');
const config = require('../config/auth.js');

const verifyToken = (req, res, next) => {
    let token = req.headers["x-access-token"] || req.headers["Authorization"];
    if(token && token.startsWith("Bearer ")) token = token.slice(7);
    if(!token) res.status(403).send({error: "Acceso Denegado. Token de sesion no proporcionado."});
    jwt.verify(token, config.accessSecret, (err, decoded) => {
        if(err) return res.status(401).send({error: "No autorizado. Token de sesion invalido o vencido."});
        req.user = decoded; //inyeccion de 'claims' de usuario
        next();
    });
};

module.exports = verifyToken;