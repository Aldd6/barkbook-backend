const dbConnection = require('../../shared/utils/index.js');
const Permission = dbConnection.Permission;
const { ApiError } = require('../../shared/utils/errors.js');

const create = async (createPermissionDTO) => {
    const newPermission = await Permission.create(createPermissionDTO);
    return newPermission;
}

const remove = async (permissionId) => {
    const permission = await Permission.findByPk(permissionId);
    if(!permission) throw new ApiError(`El permiso con el ID ${permissionId} no existe.`, "RESOURCE_NOT_FOUND");
    await permission.destroy();
    return permission;
}

const restore = async (permissionId) => {
    const permission = await Permission.findOne({
        where: { id: permissionId },
        paranoid: false
    });
    if(!permission) throw new ApiError(`El permiso con el ID ${permissionId} no existe.`, "RESOURCE_NOT_FOUND");
    await permission.restore();
    return permission;
}

const getAll = async () => {
    const permissions = await Permission.findAll();
    return permissions;
}

module.exports = { create, remove, restore, getAll }
