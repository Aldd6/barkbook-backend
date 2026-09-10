const { TYPE_TRANSACTION_ARRAY, TYPE_TRANSACTION } = require('../../shared/constants/enums.js')

module.exports = (sequelize, Sequelize) => {
    const Permission = sequelize.define('Permission', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
            field: 'id_permission'
        },
        permissionName: {
            type: Sequelize.STRING(150),
            allowNull: false,
            field: 'permission_name'
        },
        permissionType: {
            type: Sequelize.ENUM(...TYPE_TRANSACTION_ARRAY),
            allowNull: false,
            defaultValue: TYPE_TRANSACTION.READ,
            field: 'permission_type'
        }
    });

    Permission.associate = (models) => {
        Permission.belongsToMany(models.Role, { 
            through: {
                model: 'Role_Permission',
                paranoid: false,
                timestamps: false
            },
            foreignKey: 'permissionId',
            otherKey: 'roleId'
        });
    }

    return Permission;
}