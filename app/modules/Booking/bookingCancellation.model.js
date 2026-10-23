const { CANCELLATION_STATUS_ARRAY, CANCELLATION_STATUS } = require('../../shared/constants/enums.js');

module.exports = (sequelize, Sequelize) => {
    const BookingCancellation = sequelize.define('BookingCancellation', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
            field: 'id_booking_cancellation'
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
        reason: {
            type: Sequelize.STRING(255),
            allowNull: false,
            field: 'reason'
        },
        status: {
            type: Sequelize.ENUM(...CANCELLATION_STATUS_ARRAY),
            allowNull: false,
            defaultValue: CANCELLATION_STATUS.PENDIENTE,
            field: 'status'
        },
        requestedByUserId: {
            type: Sequelize.INTEGER,
            references: {
                model: 'User',
                key: 'id_user'
            },
            allowNull: false,
            field: 'requested_by_user_id'
        },
        resolvedByUserId: {
            type: Sequelize.INTEGER,
            references: {
                model: 'User',
                key: 'id_user'
            },
            allowNull: true,
            field: 'resolved_by_user_id'
        },
        resolutionNotes: {
            type: Sequelize.STRING(255),
            allowNull: true,
            field: 'resolution_notes'
        },
        resolvedAt: {
            type: Sequelize.DATE,
            allowNull: true,
            field: 'resolved_at'
        }
    });

    BookingCancellation.associate = (models) => {
        BookingCancellation.belongsTo(models.Booking, { foreignKey: 'bookingId' });
    }

    return BookingCancellation;
};
