module.exports = (sequelize, Sequelize) => {
    const RoomBranch = sequelize.define('RoomBranch', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
            field: 'id_room_branch'
        },
        branchId: {
            type: Sequelize.INTEGER,
            references: {
                model: 'Branch',
                key: 'id_branch'
            },
            allowNull: false,
            field: 'branch_id'
        },
        roomTypeId: {
            type: Sequelize.INTEGER,
            references: {
                model: 'RoomType',
                key: 'id_room_type'
            },
            allowNull: false,
            field: 'room_type_id'
        },
        maximumQuantity: {
            type: Sequelize.INTEGER,
            allowNull: false,
            validate: {
                min: {
                    args: [1],
                    msg: "La cantidad maxima debe ser al menos 1."
                }
            },
            field: 'maximum_quantity'
        }
    },
    {
        indexes: [
            {
                unique: true,
                fields: ['branch_id', 'room_type_id'],
                name: 'unique_branch_room_type'
            }
        ]
    });

    RoomBranch.associate = (models) => {
        RoomBranch.belongsTo(models.Branch, { foreignKey: 'branchId' });
        RoomBranch.belongsTo(models.RoomType, { foreignKey: 'roomTypeId' });
        RoomBranch.hasMany(models.RoomInventory, { foreignKey: 'roomBranchId' });
        RoomBranch.hasMany(models.Booking, { foreignKey: 'branchRoomId' });
    }

    return RoomBranch;
};
