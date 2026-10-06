module.exports = (sequelize, Sequelize) => {
    // Solo se relaciona con CheckIn: la reserva, la habitacion asignada y las
    // mascotas admitidas ya quedan registradas en el check-in.
    const CheckOut = sequelize.define('CheckOut', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
            field: 'id_check_out'
        },
        checkInId: {
            type: Sequelize.INTEGER,
            references: {
                model: 'CheckIn',
                key: 'id_check_in'
            },
            allowNull: false,
            unique: true,
            field: 'check_in_id'
        },
        checkOutDate: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW,
            field: 'check_out_date'
        },
        observations: {
            type: Sequelize.STRING(255),
            allowNull: true,
            field: 'observations'
        },
        // Usuario (recepcionista) que realizo el check-out.
        userId: {
            type: Sequelize.INTEGER,
            references: {
                model: 'User',
                key: 'id_user'
            },
            allowNull: true,
            field: 'user_id'
        }
    });

    CheckOut.associate = (models) => {
        CheckOut.belongsTo(models.CheckIn, { foreignKey: 'checkInId' });
        CheckOut.belongsTo(models.User, { foreignKey: 'userId' });
    }

    return CheckOut;
};
