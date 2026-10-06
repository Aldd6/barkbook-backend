const { MOVEMENT_TYPE, MOVEMENT_TYPE_ARRAY, PAYMENT_METHOD_ARRAY } = require('../../shared/constants/enums.js');

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
        // Solo se llena cuando el movimiento es un CARGO por un servicio del
        // catalogo; los cargos de hospedaje, abonos y reembolsos quedan en null.
        serviceId: {
            type: Sequelize.INTEGER,
            references: {
                model: 'Service',
                key: 'id_service'
            },
            allowNull: true,
            field: 'service_id'
        },
        // Unidades cobradas del servicio: 1 si el servicio atiende a varios
        // huespedes a la vez, o el numero de mascotas atendidas si es por mascota.
        quantity: {
            type: Sequelize.INTEGER,
            allowNull: true,
            validate: {
                min: {
                    args: [1],
                    msg: "La cantidad debe ser al menos 1."
                }
            },
            field: 'quantity'
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
        // Un CARGO puede registrarse sin metodo de pago (ej. un servicio
        // consumido durante la estancia que se paga despues); ABONO y
        // REEMBOLSO siempre lo requieren.
        methodPayment: {
            type: Sequelize.ENUM(...PAYMENT_METHOD_ARRAY),
            allowNull: true,
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
        paranoid: false,
        validate: {
            serviceOnlyOnCharge() {
                if(this.serviceId != null && this.movementType !== MOVEMENT_TYPE.CARGO) {
                    throw new Error(`Solo un movimiento de tipo "${MOVEMENT_TYPE.CARGO}" puede estar asociado a un servicio.`);
                }
            },
            quantityOnlyWithService() {
                if((this.serviceId == null) !== (this.quantity == null)) {
                    throw new Error("La cantidad solo aplica, y es obligatoria, en cargos asociados a un servicio.");
                }
            },
            paymentMethodRequiredOnPayments() {
                if(this.movementType !== MOVEMENT_TYPE.CARGO && this.methodPayment == null) {
                    throw new Error(`El metodo de pago es obligatorio en movimientos de tipo "${this.movementType}".`);
                }
            }
        }
    });

    BookingBill.associate = (models) => {
        BookingBill.belongsTo(models.Booking, { foreignKey: 'bookingId' });
        BookingBill.belongsTo(models.Service, { foreignKey: 'serviceId' });
    }

    return BookingBill;
};
