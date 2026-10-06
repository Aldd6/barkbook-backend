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
        // null = aplica a cualquier especie (ej. alimentacion); si se define,
        // solo puede cargarse a mascotas de esa especie (ej. paseo -> CANINO).
        speciesType: {
            type: Sequelize.ENUM(...PET_SPECIES_ARRAY),
            allowNull: true,
            field: 'species_type'
        },
        // true: una sola ejecucion atiende a todos los huespedes de la reserva
        // (ej. un paseo grupal) y se cobra una vez. false: se cobra por mascota.
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
    }

    return Service;
};
