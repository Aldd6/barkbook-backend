module.exports = (sequelize, Sequelize) => {
    const ServiceBranch = sequelize.define('ServiceBranch', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
            field: 'id_service_branch'
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
        serviceId: {
            type: Sequelize.INTEGER,
            references: {
                model: 'Service',
                key: 'id_service'
            },
            allowNull: false,
            field: 'service_id'
        }
    },
    {
        indexes: [
            {
                unique: true,
                fields: ['branch_id', 'service_id'],
                name: 'unique_branch_service'
            }
        ]
    });

    ServiceBranch.associate = (models) => {
        ServiceBranch.belongsTo(models.Branch, { foreignKey: 'branchId' });
        ServiceBranch.belongsTo(models.Service, { foreignKey: 'serviceId' });
    }

    return ServiceBranch;
};
