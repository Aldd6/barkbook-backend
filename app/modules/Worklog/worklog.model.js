const { METHOD_TRANSACTION_ARRAY, METHOD_TRANSACTION } = require('../../shared/constants/enums.js');

module.exports = (sequelize, Sequelize) => {
    const Worklog = sequelize.define('Worklog', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
            field: 'id_worklog'
        },
        userId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            field: 'user_id'
        },
        method: {
            type: Sequelize.ENUM(...METHOD_TRANSACTION_ARRAY),
            allowNull: false,
            defaultValue: METHOD_TRANSACTION.GET,
            field: 'method_transaction'
        },
        endpoint: {
            type: Sequelize.STRING(254),
            allowNull: false,
            field: 'endpoint_transaction'
        },
        entity: {
            type: Sequelize.STRING(150),
            allowNull: false,
            field: 'entity_affected'
        },
        statusCode: {
            type: Sequelize.INTEGER,
            allowNull: false,
            validate: {
                isIn: [[200,201,400,401,403,404,409,429,500]]
            }
        },
        detail: {
            type: Sequelize.STRING(150),
            allowNull: true
        },
        ipAddress: {
            type: Sequelize.STRING(45),
            allowNull: false,
            validate: {
                isIP: true
            }
        }
    },
    {
        timestamps: true,
        updatedAt: false,
        paranoid: false
    });

    Worklog.associate = (models) => {
        Worklog.belongsTo(models.User, { foreignKey: 'userId' });
    }

    return Worklog;
};