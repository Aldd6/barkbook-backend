require('dotenv').config({
    path: `.env.${process.env.NODE_ENV || 'development'}`
});

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const mainRouter = require('./app/routes/routes.js');
const errorHandler = require('./app/shared/middlewares/errorHandler.js');

const app = express();



// Origenes permitidos del front end, separados por coma en CORS_ORIGIN
// (ej. "http://localhost:5173,https://app.barkbook.com"). Por defecto, el
// servidor de desarrollo de Vite.
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);

// credentials:true es necesario porque el refresh token viaja en una cookie httpOnly
app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    optionsSuccessStatus: 200
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api', mainRouter);

app.use((req, res) => {
    res.status(404).json({
        success: false,
        status: 404,
        message: 'Recurso no encontrado.'
    });
});

// captura los errores propagados con next(error)
app.use(errorHandler);

module.exports = app;
