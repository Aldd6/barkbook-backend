const { PET_SPECIES_ARRAY, SEX_ARRAY, PET_SIZE_ARRAY, UNIT_MEASURE_WEIGHT_PET_ARRAY } = require('../../shared/constants/enums.js');

module.exports = (sequelize, Sequelize) => {
    const Pet = sequelize.define('Pet', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
            field: 'id_pet'
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
        name: {
            type: Sequelize.STRING(100),
            allowNull: false,
            field: 'name'
        },
        species: {
            type: Sequelize.ENUM(...PET_SPECIES_ARRAY),
            allowNull: false,
            field: 'species'
        },
        sex: {
            type: Sequelize.ENUM(...SEX_ARRAY),
            allowNull: false,
            field: 'sex'
        },
        birthday: {
            type: Sequelize.DATEONLY,
            allowNull: false,
            field: 'birthday'
        },
        size: {
            type: Sequelize.ENUM(...PET_SIZE_ARRAY),
            allowNull: false,
            field: 'size'
        },
        actualWeight: {
            type: Sequelize.DECIMAL(6, 2),
            allowNull: false,
            validate: {
                min: {
                    args: [0.01],
                    msg: "El peso debe ser mayor a 0."
                }
            },
            field: 'actual_weight'
        },
        unitOfMeasureWeight: {
            type: Sequelize.ENUM(...UNIT_MEASURE_WEIGHT_PET_ARRAY),
            allowNull: false,
            field: 'unit_of_measure_weight'
        },
        sociabilityLevel: {
            type: Sequelize.INTEGER,
            allowNull: false,
            validate: {
                min: {
                    args: [0],
                    msg: "El nivel de sociabilidad minimo es 0."
                },
                max: {
                    args: [5],
                    msg: "El nivel de sociabilidad maximo es 5."
                }
            },
            field: 'sociability_level'
        },
        isNeutered: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'is_neutered'
        },
        vaccinationCard: {
            type: Sequelize.STRING(500),
            allowNull: true,
            field: 'vaccination_card'
        },
        profilePicture: {
            type: Sequelize.STRING(500),
            allowNull: true,
            field: 'profile_picture'
        }
    });

    Pet.associate = (models) => {
        Pet.belongsTo(models.Customer, { foreignKey: 'customerId' });
        Pet.hasMany(models.PetVaccine, { foreignKey: 'petId' });
        Pet.hasMany(models.PetSanity, { foreignKey: 'petId' });
        Pet.hasMany(models.PetDiet, { foreignKey: 'petId' });
        Pet.hasMany(models.BookingPet, { foreignKey: 'petId' });
    }

    return Pet;
};
