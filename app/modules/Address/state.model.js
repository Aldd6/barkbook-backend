module.exports = (sequelize, Sequelize) => {
    const State = sequelize.define('State', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
            field: 'id_state'
        },
        stateName: {
            type: Sequelize.STRING(200),
            allowNull: false,
            field: 'state_name'
        }
    }, 
    {
        timestamps: false,
        paranoid: false
    });

    State.associate = (models) => {
        State.hasMany(models.City, { foreignKey: 'stateId' });
    }

    return State;
}