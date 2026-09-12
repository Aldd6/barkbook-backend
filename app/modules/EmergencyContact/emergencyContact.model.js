const { KINSHIP_ARRAY } = require('../../shared/constants/enums.js');

module.exports = (sequelize, Sequelize) => {
    const EmergencyContact = sequelize.define('EmergencyContact', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
            field: 'id_emergency_contact'
        },
        customerId: {
            type: Sequelize.INTEGER,
            references: {
                model: 'Customer',
                key: 'id_customer'
            },
            allowNull: false,
            field: 'customer_id'
        },
        name: {
            type: Sequelize.STRING(100),
            allowNull: false,
            field: 'name'
        },
        lastname: {
            type: Sequelize.STRING(100),
            allowNull: false,
            field: 'lastname'
        },
        kinship: {
            type: Sequelize.ENUM(...KINSHIP_ARRAY),
            allowNull: false,
            field: 'kinship'
        },
        phoneNumber: {
            type: Sequelize.STRING(12),
            allowNull: false,
            validate: {
                is: {
                    args: [/^\+502\d{8}$/],
                    msg: "El numero de telefono debe tener el formato +502 seguido de 8 digitos."
                }
            },
            field: 'phone_number'
        }
    });

    EmergencyContact.associate = (models) => {
        EmergencyContact.belongsTo(models.Customer, { foreignKey: 'customerId' });
    }

    return EmergencyContact;
};
