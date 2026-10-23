const { SERVICE_ORDER_STATUS_ARRAY, SERVICE_ORDER_STATUS } = require('../../shared/constants/enums.js');

module.exports = (sequelize, Sequelize) => {
    const ServiceOrder = sequelize.define('ServiceOrder', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
            field: 'id_service_order'
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
        serviceId: {
            type: Sequelize.INTEGER,
            references: {
                model: 'Service',
                key: 'id_service'
            },
            allowNull: false,
            field: 'service_id'
        },
        status: {
            type: Sequelize.ENUM(...SERVICE_ORDER_STATUS_ARRAY),
            allowNull: false,
            defaultValue: SERVICE_ORDER_STATUS.PENDIENTE,
            field: 'status'
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
        description: {
            type: Sequelize.STRING(255),
            allowNull: true,
            field: 'description'
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
        },
        bookingBillId: {
            type: Sequelize.INTEGER,
            references: {
                model: 'BookingBill',
                key: 'id_booking_bill'
            },
            allowNull: true,
            unique: true,
            field: 'booking_bill_id'
        }
    },
    {
        validate: {
            chargeOnlyWhenCompleted() {
                if((this.bookingBillId != null) !== (this.status === SERVICE_ORDER_STATUS.COMPLETADO)) {
                    throw new Error(`Solo una orden "${SERVICE_ORDER_STATUS.COMPLETADO}" tiene, y debe tener, un cargo asociado.`);
                }
            }
        }
    });

    ServiceOrder.associate = (models) => {
        ServiceOrder.belongsTo(models.Booking, { foreignKey: 'bookingId' });
        ServiceOrder.belongsTo(models.Service, { foreignKey: 'serviceId' });
        ServiceOrder.belongsTo(models.BookingBill, { foreignKey: 'bookingBillId' });
        ServiceOrder.hasMany(models.ServiceOrderPet, { foreignKey: 'serviceOrderId' });
    }

    return ServiceOrder;
};
