const { BOOKING_STATUS_ARRAY, BOOKING_STATUS } = require('../../shared/constants/enums.js');

module.exports = (sequelize, Sequelize) => {
    const Booking = sequelize.define('Booking', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
            field: 'id_booking'
        },
        branchRoomId: {
            type: Sequelize.INTEGER,
            references: {
                model: 'RoomBranch',
                key: 'id_room_branch'
            },
            allowNull: false,
            field: 'branch_room_id'
        },
        customerId: {
            type: Sequelize.INTEGER,
            references: {
                model: 'Customer',
                key: 'id_customer'
            },
            allowNull: false,
            field: 'customer_id'
        },
        checkInDate: {
            type: Sequelize.DATEONLY,
            allowNull: false,
            field: 'check_in_date'
        },
        checkOutDate: {
            type: Sequelize.DATEONLY,
            allowNull: false,
            field: 'check_out_date'
        },
        bookingStatus: {
            type: Sequelize.ENUM(...BOOKING_STATUS_ARRAY),
            allowNull: false,
            defaultValue: BOOKING_STATUS.PDCN,
            field: 'booking_status'
        },
        nightlyRate: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: false,
            validate: {
                min: {
                    args: [0.01],
                    msg: "La tarifa por noche debe ser mayor a 0."
                }
            },
            field: 'nightly_rate'
        },
        cancellationReason: {
            type: Sequelize.STRING(255),
            allowNull: true,
            field: 'cancellation_reason'
        }
    },
    {
        validate: {
            checkOutAfterCheckIn() {
                if(this.checkInDate && this.checkOutDate && this.checkOutDate <= this.checkInDate) {
                    throw new Error("La fecha de check-out debe ser posterior a la fecha de check-in.");
                }
            }
        }
    });

    Booking.associate = (models) => {
        Booking.belongsTo(models.RoomBranch, { foreignKey: 'branchRoomId' });
        Booking.belongsTo(models.Customer, { foreignKey: 'customerId' });
        Booking.hasMany(models.BookingPet, { foreignKey: 'bookingId' });
        Booking.hasMany(models.BookingBill, { foreignKey: 'bookingId' });
    }

    return Booking;
};
