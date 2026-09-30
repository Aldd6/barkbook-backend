const { DIET_TYPE_ARRAY, UNIT_MEASURE_SERVING_PET_ARRAY } = require('../../shared/constants/enums.js');

module.exports = (sequelize, Sequelize) => {
    const PetDiet = sequelize.define('PetDiet', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
            field: 'id_pet_diet'
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
        dietType: {
            type: Sequelize.ENUM(...DIET_TYPE_ARRAY),
            allowNull: false,
            field: 'diet_type'
        },
        timesToEatAday: {
            type: Sequelize.INTEGER,
            allowNull: false,
            validate: {
                min: {
                    args: [1],
                    msg: "Las veces al dia que come la mascota deben ser al menos 1."
                }
            },
            field: 'times_to_eat_a_day'
        },
        servings: {
            type: Sequelize.DECIMAL(5, 2),
            allowNull: false,
            validate: {
                min: {
                    args: [0.01],
                    msg: "La porcion debe ser mayor a 0."
                }
            },
            field: 'servings'
        },
        unitOfMeasureServing: {
            type: Sequelize.ENUM(...UNIT_MEASURE_SERVING_PET_ARRAY),
            allowNull: false,
            field: 'unit_of_measure_serving'
        },
        observations: {
            type: Sequelize.STRING(500),
            allowNull: true,
            field: 'observations'
        },
        // Solo debe existir una dieta activa por mascota a la vez. Esa regla
        // NO se enforce aqui: la garantiza petDiet.service.js (desactivando
        // las demas dentro de una transaccion) mas un indice unico parcial
        // (pet_id) WHERE active_diet = true como defensa a nivel de base de
        // datos, ver el bloque `indexes` abajo.
        activeDiet: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'active_diet'
        }
    },
    {
        indexes: [
            {
                unique: true,
                fields: ['pet_id'],
                where: { active_diet: true },
                name: 'unique_active_diet_per_pet'
            }
        ]
    });

    PetDiet.associate = (models) => {
        PetDiet.belongsTo(models.Pet, { foreignKey: 'petId' });
    }

    return PetDiet;
};
