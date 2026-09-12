module.exports = (sequelize, Sequelize) => {
    const Customer = sequelize.define('Customer', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
            field: 'id_customer'
        },
        userId: {
            type: Sequelize.INTEGER,
            references: {
                model: 'User',
                key: 'id_user'
            },
            allowNull: false,
            unique: true,
            field: 'user_id'
        },
        cityId: {
            type: Sequelize.INTEGER,
            references: {
                model: 'City',
                key: 'id_city'
            },
            allowNull: false,
            field: 'city_id'
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
        dpiNumber: {
            type: Sequelize.STRING(13),
            allowNull: false,
            unique: true,
            validate: {
                is: {
                    args: [/^\d{13}$/],
                    msg: "El DPI debe contener exactamente 13 digitos numericos."
                }
            },
            field: 'dpi_number'
        },
        // true = factura con NIT, false = factura como Consumidor Final (CF)
        nitOrCf: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'nit_or_cf'
        },
        nitNumber: {
            type: Sequelize.STRING(15),
            allowNull: true,
            field: 'nit_number'
        },
        addressLineOne: {
            type: Sequelize.STRING(254),
            allowNull: false,
            field: 'address_line_one'
        },
        addressLineTwo: {
            type: Sequelize.STRING(254),
            allowNull: true,
            field: 'address_line_two'
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
        },
        profilePicture: {
            type: Sequelize.STRING(500),
            allowNull: true,
            field: 'profile_picture'
        },
        termsAcceptance: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'terms_acceptance'
        }
    },
    {
        validate: {
            // defensa en profundidad: la misma regla que ya valida el DTO
            // (el nitNumber es obligatorio unicamente si nitOrCf es true).
            nitConsistency() {
                if(this.nitOrCf && !this.nitNumber) {
                    throw new Error("El numero de NIT es obligatorio cuando el cliente factura con NIT.");
                }
            }
        }
    });

    Customer.associate = (models) => {
        Customer.belongsTo(models.User, { foreignKey: 'userId' });
        Customer.belongsTo(models.City, { foreignKey: 'cityId' });
    }

    return Customer;
};
