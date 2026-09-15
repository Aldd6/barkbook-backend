require('dotenv').config({
    path: `.env.${process.env.NODE_ENV || 'development'}`
});

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const mainRouter = require('./app/routes/index.js');
const errorHandler = require('./app/shared/middlewares/errorHandler.js');

const app = express();

// credentials:true es necesario porque el refresh token viaja en una cookie httpOnly
app.use(cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : true,
    credentials: true
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

// siempre al final: captura los errores propagados con next(error)
app.use(errorHandler);

module.exports = app;
