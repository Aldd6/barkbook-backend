const dbConnection = require('../../shared/utils/index.js');
const Role = dbConnection.Role;
const Permission = dbConnection.Permission;
const { ApiError } = require('../../shared/utils/errors.js');
const Op = dbConnection.Sequelize.Op;

const create = async (CreateRoleDTO) => {
    const { name } = CreateRoleDTO;
    const roleExists = await Role.findOne({ 
        where: { 
            roleName: {
                [Op.eq] : name
            }
        }
    });
    if(roleExists) throw new ApiError(`El rol con el nombre ${name} ya existe.`, "RESOURCE_CONFLICT");
    const newRole = await Role.create({ roleName: name });
    return newRole;
};

const updatePermissions = async (UpdatePermissionsRoleDTO) => {
    const { id, permissionsIds } = UpdatePermissionsRoleDTO;
    const role = await Role.findByPk(id);
    if(!role) throw new ApiError(`El rol con el ID ${id} no existe.`, "RESOURCE_NOT_FOUND");
    await role.setPermissions(permissionsIds);
    const updatedRole = await Role.findByPk(id, {
        include: {
            model: Permission,
            through: { attributes: [] },
            required: false
        }
    });
    return updatedRole;
};

const remove = async (id) => {
    const role = await Role.findByPk(id);
    if(!role) throw new ApiError(`El rol con el ID ${id} no existe.`, "RESOURCE_NOT_FOUND");
    await role.destroy();
    return role;
}

const restore = async (roleId) => {
    const role = await Role.findOne({
        where: { id: roleId },
        paranoid: false
    });
    if(!role) throw new ApiError(`El rol con el ID ${roleId} no existe.`, "RESOURCE_NOT_FOUND");
    await role.restore();
    return role;
}

const getAll = async () => {
    const roles = await Role.findAll({
        include: [
            {
                model: Permission,
                through: { attributes:[] },
                required: false
            }
        ]
    });
    return roles;
}

const getById = async (id) => {
    const role = await Role.findByPk(id);
    if(!role) throw new ApiError(`El rol con el ID ${id} no existe.`, "RESOURCE_NOT_FOUND");
    return role;
}

const getAllPermissionsAssociatedToRole = async (id) => {
    const role = await Role.findByPk(id, {
        include: [
            {
                model: Permission,
                through: { attributes: [] },
                required: false
            }
        ]
    });
    if(!role) throw new ApiError(`El rol con el ID ${id} no existe.`, "RESOURCE_NOT_FOUND");
    return role.Permissions || [];
}

module.exports = { create, remove, restore, updatePermissions, getAll, getById, getAllPermissionsAssociatedToRole };