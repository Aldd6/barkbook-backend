const { VACCINE_USE_ARRAY } = require('../../shared/constants/enums.js');

module.exports = (sequelize, Sequelize) => {
    const PetVaccine = sequelize.define('PetVaccine', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
            field: 'id_pet_vaccine'
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
        vaccineName: {
            type: Sequelize.STRING(150),
            allowNull: false,
            field: 'vaccine_name'
        },
        vaccineUse: {
            type: Sequelize.ENUM(...VACCINE_USE_ARRAY),
            allowNull: false,
            field: 'vaccine_use'
        },
        dateOfPlacement: {
            type: Sequelize.DATEONLY,
            allowNull: false,
            field: 'date_of_placement'
        }
    });

    PetVaccine.associate = (models) => {
        PetVaccine.belongsTo(models.Pet, { foreignKey: 'petId' });
    }

    return PetVaccine;
};
