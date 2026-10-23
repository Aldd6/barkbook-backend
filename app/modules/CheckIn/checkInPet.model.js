module.exports = (sequelize, Sequelize) => {
    const CheckInPet = sequelize.define('CheckInPet', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
            field: 'id_check_in_pet'
        },
        checkInId: {
            type: Sequelize.INTEGER,
            references: {
                model: 'CheckIn',
                key: 'id_check_in'
            },
            allowNull: false,
            field: 'check_in_id'
        },
        bookingPetId: {
            type: Sequelize.INTEGER,
            references: {
                model: 'BookingPet',
                key: 'id_booking_pet'
            },
            allowNull: false,
            field: 'booking_pet_id'
        },
        admitted: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'admitted'
        },
        nonadmissionReason: {
            type: Sequelize.STRING(255),
            allowNull: true,
            field: 'non_admission_reason'
        }
    },
    {
        indexes: [
            {
                unique: true,
                fields: ['check_in_id', 'booking_pet_id'],
                name: 'unique_booking_pet_per_check_in'
            }
        ]
    });

    CheckInPet.associate = (models) => {
        CheckInPet.belongsTo(models.CheckIn, { foreignKey: 'checkInId' });
        CheckInPet.belongsTo(models.BookingPet, { foreignKey: 'bookingPetId' });
    }

    return CheckInPet;
};
