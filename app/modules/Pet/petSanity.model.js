module.exports = (sequelize, Sequelize) => {
    const PetSanity = sequelize.define('PetSanity', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
            field: 'id_pet_sanity'
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
        illnessName: {
            type: Sequelize.STRING(150),
            allowNull: false,
            field: 'illness_name'
        },
        isCronic: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'is_cronic'
        },
        isContagious: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'is_contagious'
        },
        sufferedSince: {
            type: Sequelize.DATEONLY,
            allowNull: false,
            field: 'suffered_since'
        },
        enduredUntil: {
            type: Sequelize.DATEONLY,
            allowNull: true,
            field: 'endured_until'
        },
        // No es columna real: null en enduredUntil = enfermedad activa.
        // Se deriva asi para que nunca quede desincronizado de enduredUntil,
        // y paranoid se deja solo para su uso normal (borrar un registro
        // capturado por error), no para representar "enfermedad resuelta".
        isIllnessActive: {
            type: Sequelize.VIRTUAL,
            get() {
                return this.getDataValue('enduredUntil') == null;
            }
        }
    },
    {
        validate: {
            enduredUntilAfterSufferedSince() {
                if(this.enduredUntil && this.sufferedSince && this.enduredUntil < this.sufferedSince) {
                    throw new Error("La fecha en que finalizo la enfermedad no puede ser anterior a la fecha en que inicio.");
                }
            }
        }
    });

    PetSanity.associate = (models) => {
        PetSanity.belongsTo(models.Pet, { foreignKey: 'petId' });
    }

    return PetSanity;
};
