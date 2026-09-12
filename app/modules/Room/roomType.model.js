const { PET_SPECIES_ARRAY } = require('../../shared/constants/enums.js');

module.exports = (sequelize, Sequelize) => {
    const RoomType = sequelize.define('RoomType', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
            field: 'id_room_type'
        },
        name: {
            type: Sequelize.STRING(100),
            allowNull: false,
            unique: true,
            field: 'name'
        },
        // Prefijo usado para armar el numero de habitacion en RoomInventory
        // (ej. "STD" + "001" = "STD001"). Unico para que dos tipos de
        // habitacion no puedan generar codigos ambiguos entre si.
        prefix: {
            type: Sequelize.STRING(10),
            allowNull: false,
            unique: true,
            validate: {
                is: {
                    args: [/^[A-Z0-9]{2,10}$/],
                    msg: "El prefijo debe tener entre 2 y 10 caracteres, solo letras mayusculas y numeros."
                }
            },
            field: 'prefix'
        },
        speciesType: {
            type: Sequelize.ENUM(...PET_SPECIES_ARRAY),
            allowNull: false,
            field: 'species_type'
        },
        isCage: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'is_cage'
        },
        lengthDimension: {
            type: Sequelize.DECIMAL(5, 2),
            allowNull: false,
            validate: {
                min: {
                    args: [0.01],
                    msg: "El largo debe ser mayor a 0."
                }
            },
            field: 'length_dimension'
        },
        widthDimensions: {
            type: Sequelize.DECIMAL(5, 2),
            allowNull: false,
            validate: {
                min: {
                    args: [0.01],
                    msg: "El ancho debe ser mayor a 0."
                }
            },
            field: 'width_dimensions'
        },
        heightDimensions: {
            type: Sequelize.DECIMAL(5, 2),
            allowNull: false,
            validate: {
                min: {
                    args: [0.01],
                    msg: "El alto debe ser mayor a 0."
                }
            },
            field: 'height_dimensions'
        },
        description: {
            type: Sequelize.STRING(500),
            allowNull: true,
            field: 'description'
        },
        hasAC: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'has_ac'
        },
        isSoundproofed: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'is_soundproofed'
        },
        hasCCTV: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'has_cctv'
        },
        hasOrthopedicBed: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'has_orthopedic_bed'
        },
        hasPrivateYard: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'has_private_yard'
        },
        hasSharedYard: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'has_shared_yard'
        },
        hasToys: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'has_toys'
        },
        maximumNumberOfGuests: {
            type: Sequelize.INTEGER,
            allowNull: false,
            validate: {
                min: {
                    args: [1],
                    msg: "El maximo de huespedes debe ser al menos 1."
                }
            },
            field: 'maximum_number_of_guests'
        },
        nightlyRate: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: false,
            validate: {
                min: {
                    args: [0.01],
                    msg: "La tarifa por noche debe ser mayor a 0."
                }
            },
            field: 'nightly_rate'
        }
    });

    RoomType.associate = (models) => {
        RoomType.hasMany(models.RoomBranch, { foreignKey: 'roomTypeId' });
    }

    return RoomType;
};
