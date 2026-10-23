const { SERVICE_TYPE_ARRAY, PET_SPECIES_ARRAY } = require('../../shared/constants/enums.js');

module.exports = (sequelize, Sequelize) => {
    const Service = sequelize.define('Service', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
            field: 'id_service'
        },
        name: {
            type: Sequelize.STRING(100),
            allowNull: false,
            unique: true,
            field: 'name'
        },
        description: {
            type: Sequelize.STRING(500),
            allowNull: true,
            field: 'description'
        },
        serviceType: {
            type: Sequelize.ENUM(...SERVICE_TYPE_ARRAY),
            allowNull: false,
            field: 'service_type'
        },
        speciesType: {
            type: Sequelize.ENUM(...PET_SPECIES_ARRAY),
            allowNull: true,
            field: 'species_type'
        },
        isMultiGuest: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'is_multi_guest'
        },
        rate: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: false,
            validate: {
                min: {
                    args: [0.01],
                    msg: "La tarifa del servicio debe ser mayor a 0."
                }
            },
            field: 'rate'
        }
    });

    Service.associate = (models) => {
        Service.hasMany(models.ServiceBranch, { foreignKey: 'serviceId' });
        Service.hasMany(models.BookingBill, { foreignKey: 'serviceId' });
        Service.hasMany(models.ServiceOrder, { foreignKey: 'serviceId' });
    }

    return Service;
};
