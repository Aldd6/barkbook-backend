module.exports = (sequelize, Sequelize) => {
    const Role = sequelize.define('Role', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
            field: 'id_role'
        },
        roleName: {
            type: Sequelize.STRING(150),
            allowNull: false,
            field: 'role_name',
            unique: true
        }
    });

    Role.associate = (models) => {
        Role.hasMany(models.User, { foreignKey: 'rolId' });
        Role.belongsToMany(models.Permission, { 
            through: {
                model: 'Role_Permission',
                paranoid: false,
                timestamps: false
            },
            foreignKey: 'roleId',
            otherKey: 'permissionId',
        });
    }

    return Role;
};