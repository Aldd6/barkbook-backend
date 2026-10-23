module.exports = (sequelize, Sequelize) => {
    const ServiceOrderPet = sequelize.define('ServiceOrderPet', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
            field: 'id_service_order_pet'
        },
        serviceOrderId: {
            type: Sequelize.INTEGER,
            references: {
                model: 'ServiceOrder',
                key: 'id_service_order'
            },
            allowNull: false,
            field: 'service_order_id'
        },
        petId: {
            type: Sequelize.INTEGER,
            references: {
                model: 'Pet',
                key: 'id_pet'
            },
            allowNull: false,
            field: 'pet_id'
        }
    },
    {
        indexes: [
            {
                unique: true,
                fields: ['service_order_id', 'pet_id'],
                name: 'unique_pet_per_service_order'
            }
        ]
    });

    ServiceOrderPet.associate = (models) => {
        ServiceOrderPet.belongsTo(models.ServiceOrder, { foreignKey: 'serviceOrderId' });
        ServiceOrderPet.belongsTo(models.Pet, { foreignKey: 'petId' });
    }

    return ServiceOrderPet;
};
