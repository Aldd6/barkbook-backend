module.exports = (sequelize, Sequelize) => {
    const Branch = sequelize.define('Branch', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
            field: 'id_branch'
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
        branchName: {
            type: Sequelize.STRING(150),
            allowNull: false,
            unique: true,
            field: 'branch_name'
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
        }
    });

    Branch.associate = (models) => {
        Branch.belongsTo(models.City, { foreignKey: 'cityId' });
    }

    return Branch;
};
