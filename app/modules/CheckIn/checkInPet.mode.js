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
        petId: {
            type: Sequelize.INTEGER,
            references: {
                model: 'Pet',
                key: 'id_pet'
            },
            allowNull: false,
            field: 'pet_id'
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
    });

    CheckInPet.associate = (models) => {
        CheckInPet.belongsTo(models.CheckIn, { foreignKey: 'checkInId' });
        CheckInPet.belongsTo(models.Pet, { foreignKey: 'petId' });
    }

    return CheckInPet;
};