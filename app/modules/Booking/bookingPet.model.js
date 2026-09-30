module.exports = (sequelize, Sequelize) => {
    const BookingPet = sequelize.define('BookingPet', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
            field: 'id_booking_pet'
        },
        petId: {
            type: Sequelize.INTEGER,
            references: {
                model: 'Pet',
                key: 'id_pet'
            },
            allowNull: false,
            field: 'pet_id'
        },
        bookingId: {
            type: Sequelize.INTEGER,
            references: {
                model: 'Booking',
                key: 'id_booking'
            },
            allowNull: false,
            field: 'booking_id'
        }
    },
    {
        indexes: [
            {
                unique: true,
                fields: ['booking_id', 'pet_id'],
                name: 'unique_pet_per_booking'
            }
        ]
    });

    BookingPet.associate = (models) => {
        BookingPet.belongsTo(models.Pet, { foreignKey: 'petId' });
        BookingPet.belongsTo(models.Booking, { foreignKey: 'bookingId' });
    }

    return BookingPet;
};
