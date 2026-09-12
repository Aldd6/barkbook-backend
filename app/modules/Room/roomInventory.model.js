const { ROOM_STATUS_ARRAY, ROOM_STATUS } = require('../../shared/constants/enums.js');

module.exports = (sequelize, Sequelize) => {
    const RoomInventory = sequelize.define('RoomInventory', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
            field: 'id_room_inventory'
        },
        roomBranchId: {
            type: Sequelize.INTEGER,
            references: {
                model: 'RoomBranch',
                key: 'id_room_branch'
            },
            allowNull: false,
            field: 'room_branch_id'
        },
        // Generado por roomInventory.service.js::generateBulk, nunca a mano:
        // prefijo del RoomType + un consecutivo con padding segun
        // maximumQuantity de la RoomBranch (ej. "STD001").
        roomNumber: {
            type: Sequelize.STRING(20),
            allowNull: false,
            field: 'room_number'
        },
        status: {
            type: Sequelize.ENUM(...ROOM_STATUS_ARRAY),
            allowNull: false,
            defaultValue: ROOM_STATUS.DSPN,
            field: 'status'
        },
        active: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            field: 'active'
        }
    },
    {
        indexes: [
            {
                unique: true,
                fields: ['room_branch_id', 'room_number'],
                name: 'unique_room_number_per_branch'
            }
        ]
    });

    RoomInventory.associate = (models) => {
        RoomInventory.belongsTo(models.RoomBranch, { foreignKey: 'roomBranchId' });
    }

    return RoomInventory;
};
