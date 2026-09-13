const { MOVEMENT_TYPE_ARRAY, PAYMENT_METHOD_ARRAY } = require('../../shared/constants/enums.js');

module.exports = (sequelize, Sequelize) => {
    const BookingBill = sequelize.define('BookingBill', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
            field: 'id_booking_bill'
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
        movementType: {
            type: Sequelize.ENUM(...MOVEMENT_TYPE_ARRAY),
            allowNull: false,
            field: 'movement_type'
        },
        amount: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: false,
            validate: {
                min: {
                    args: [0.01],
                    msg: "El monto debe ser mayor a 0."
                }
            },
            field: 'amount'
        },
        methodPayment: {
            type: Sequelize.ENUM(...PAYMENT_METHOD_ARRAY),
            allowNull: false,
            field: 'method_payment'
        },
        // Ej. id de PaymentIntent de Stripe, numero de voucher de POS, o de
        // transferencia bancaria. No aplica siempre (ej. EFECTIVO).
        reference: {
            type: Sequelize.STRING(150),
            allowNull: true,
            field: 'reference'
        },
        description: {
            type: Sequelize.STRING(255),
            allowNull: true,
            field: 'description'
        }
    },
    {
        timestamps: true,
        updatedAt: false,
        paranoid: false
    });

    BookingBill.associate = (models) => {
        BookingBill.belongsTo(models.Booking, { foreignKey: 'bookingId' });
    }

    return BookingBill;
};
