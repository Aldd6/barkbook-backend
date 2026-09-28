const { CHECK_IN_STATUS_ARRAY, CHECK_IN_STATUS } = require('../../shared/constants/enums.js');

module.exports = (sequelize, Sequelize) => {
    const CheckIn = sequelize.define('CheckIn', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
            field: 'id_check_in'
        },
        bookingId: {
            type: Sequelize.INTEGER,
            references: {
                model: 'Booking',
                key: 'id_booking'
            },
            allowNull: false,
            field: 'booking_id'
        },
        checkInDate: {
            type: Sequelize.DATEONLY,
            allowNull: false,
            field: 'check_in_date'
        },
        observations: {
            type: Sequelize.STRING(255),
            allowNull: true,
            field: 'observations'
        },
        status: {
            type: Sequelize.ENUM(...CHECK_IN_STATUS_ARRAY),
            allowNull: false,
            field: 'status'
        }
    });

    CheckIn.associate = (models) => {
        CheckIn.belongsTo(models.Booking, { foreignKey: 'bookingId' });
        CheckIn.hasMany(models.CheckInPet, { foreignKey: 'checkInId' });
    }

    return CheckIn;
};