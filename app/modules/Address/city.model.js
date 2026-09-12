module.exports = (sequelize, Sequelize) => {
    const City = sequelize.define('City', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
            field: 'id_city'
        },
        stateId: {
            type: Sequelize.INTEGER,
            references: {
                model: 'State',
                key: 'id_state'
            },
            allowNull: false,
            field: 'state_id'
        },
        cityName: {
            type: Sequelize.STRING(200),
            allowNull: false,
            field: 'city_name'
        }
    }, 
    {
        timestamps: false,
        paranoid: false
    });

    City.associate = (models) => {
        City.belongsTo(models.State, { foreignKey: 'stateId' });
        City.hasMany(models.Branch, { foreignKey: 'cityId' });
    }

    return City;
}