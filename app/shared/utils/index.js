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
dbConnection.User = require('../../modules/Users/user.model.js')(sequelize, Sequelize);
dbConnection.Role = require('../../modules/Roles/role.model.js')(sequelize, Sequelize);
dbConnection.Permission = require('../../modules/Permissions/permission.model.js')(sequelize, Sequelize);
dbConnection.Worklog = require('../../modules/Worklog/worklog.model.js')(sequelize, Sequelize);
dbConnection.State = require('../../modules/Address/state.model.js')(sequelize, Sequelize);
dbConnection.City = require('../../modules/Address/city.model.js')(sequelize, Sequelize);

//Ejecucion de asociaciones embebidas en los modelos
Object.keys(dbConnection).forEach(model => {
    if(dbConnection[model].associate) {
        dbConnection[model].associate(dbConnection);
    }
});

module.exports = dbConnection;