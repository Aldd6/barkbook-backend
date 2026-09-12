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
dbConnection.Branch = require('../../modules/Branch/branch.model.js')(sequelize, Sequelize);
dbConnection.Employee = require('../../modules/Employee/employee.model.js')(sequelize, Sequelize);
dbConnection.Customer = require('../../modules/Customer/customer.model.js')(sequelize, Sequelize);
dbConnection.EmergencyContact = require('../../modules/EmergencyContact/emergencyContact.model.js')(sequelize, Sequelize);
dbConnection.Pet = require('../../modules/Pet/pet.model.js')(sequelize, Sequelize);
dbConnection.PetVaccine = require('../../modules/Pet/petVaccine.model.js')(sequelize, Sequelize);
dbConnection.PetSanity = require('../../modules/Pet/petSanity.model.js')(sequelize, Sequelize);
dbConnection.PetDiet = require('../../modules/Pet/petDiet.model.js')(sequelize, Sequelize);
dbConnection.RoomType = require('../../modules/Room/roomType.model.js')(sequelize, Sequelize);
dbConnection.RoomBranch = require('../../modules/Room/roomBranch.model.js')(sequelize, Sequelize);
dbConnection.RoomInventory = require('../../modules/Room/roomInventory.model.js')(sequelize, Sequelize);

//Ejecucion de asociaciones embebidas en los modelos
Object.keys(dbConnection).forEach(model => {
    if(dbConnection[model].associate) {
        dbConnection[model].associate(dbConnection);
    }
});

module.exports = dbConnection;