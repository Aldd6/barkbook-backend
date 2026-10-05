const { CHECK_IN_STATUS_ARRAY } = require('../../shared/constants/enums.js');

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
            unique: true,
            field: 'booking_id'
        },
        // Habitacion fisica asignada a la reserva al completar el check-in.
        // Queda en null cuando el check-in se cancela.
        roomInventoryId: {
            type: Sequelize.INTEGER,
            references: {
                model: 'RoomInventory',
                key: 'id_room_inventory'
            },
            allowNull: true,
            field: 'room_inventory_id'
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
        CheckIn.belongsTo(models.RoomInventory, { foreignKey: 'roomInventoryId' });
        CheckIn.hasMany(models.CheckInPet, { foreignKey: 'checkInId' });
    }

    return CheckIn;
};