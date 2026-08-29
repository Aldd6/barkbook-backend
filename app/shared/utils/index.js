const config = require('../config/db.config.js');
const Sequelize = require('sequelize');

const sequelizeOptions = {
    host: config.host,
    dialect: config.dialect,
    pool: {
        max: config.pool.max,
        min: config.pool.min,
        acquire: config.pool.acquire,
        idle: config.pool.idle
    },
    define: {
        //opciones globales de tablas
        freezeTableName: true,
        timestamps: true,
        paranoid: true,
        createdAt: 'creadoEn',
        updatedAt: 'actualizadoEn',
        deletedAt: 'archivadoEn'
    }
};

if(config.ssl) {
    sequelizeOptions.dialectOptions = {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    }
}

const sequelize = new Sequelize(config.dbName, config.user, config.password, sequelizeOptions);
const dbConnection = {};

dbConnection.Sequelize = Sequelize;
dbConnection.sequelize = sequelize;

//agregar modelos aqui

module.exports = dbConnection;