module.exports = (sequelize, Sequelize) => {
    const Employee = sequelize.define('Employee', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
            field: 'id_employee'
        },
        userId: {
            type: Sequelize.INTEGER,
            references: {
                model: 'User',
                key: 'id_user'
            },
            allowNull: true,
            unique: true,
            field: 'user_id'
        },
        branchId: {
            type: Sequelize.INTEGER,
            references: {
                model: 'Branch',
                key: 'id_branch'
            },
            allowNull: false,
            field: 'branch_id'
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
                    msg: "El numero de telefono debe tener el formato +502 seguido de 8 digitos (sin guion o espacio)."
                }
            },
            field: 'phone_number'
        },
        profilePicture: {
            type: Sequelize.STRING(500),
            allowNull: true,
            field: 'profile_picture'
        }
    });

    Employee.associate = (models) => {
        Employee.belongsTo(models.User, { foreignKey: 'userId' });
        Employee.belongsTo(models.Branch, { foreignKey: 'branchId' });
        Employee.belongsTo(models.City, { foreignKey: 'cityId' });
    }

    return Employee;
};
