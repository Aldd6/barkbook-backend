const permissionService = require('./permission.service.js');
const PermissionCreateDTO = require('./DTOs/create-permission.js');
const PermissionResponseDTO = require('./DTOs/permission-response.js');

const create = async (req, res, next) => {
    try {
        const requestDTO = PermissionCreateDTO.parse(req.body);
        const newPermission = await permissionService.create(requestDTO);
        const responseDTO = PermissionResponseDTO.parse({
            id: newPermission.id,
            permissionName: newPermission.permissionName,
            permissionType: newPermission.permissionType
        });
        return res.status(201).json({
            success: true,
            status: 201,
            message: "Permiso creado exitosamente.",
            permission: responseDTO
        });
    } catch(error) {
        next(error);
    }
};

const remove = async (req, res, next) => {
    try {
        const { permissionId } = req.params;
        const permissionToRemove = await permissionService.remove(permissionId);
        const responseDTO = PermissionResponseDTO.parse({
            id: permissionToRemove.id,
            permissionName: permissionToRemove.permissionName,
            permissionType: permissionToRemove.permissionType
        });
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Permiso eliminado exitosamente.",
            permission: responseDTO
        });
    } catch(error) {
        next(error);
    }
};

const restore = async (req, res, next) => {
    try {
        const { permissionId } = req.params;
        const permissionToRestore = await permissionService.restore(permissionId);
        const responseDTO = PermissionResponseDTO.parse({
            id: permissionToRestore.id,
            permissionName: permissionToRestore.permissionName,
            permissionType: permissionToRestore.permissionType
        });
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Permiso restaurado exitosamente.",
            permission: responseDTO
        });
    } catch(error) {
        next(error);
    }
}

const getAll = async (req, res, next) => {
    try {
        const permissions = await permissionService.getAll();
        const responseDTOs = permissions.map(p => PermissionResponseDTO.parse({
            id: p.id,
            permissionName: p.permissionName,
            permissionType: p.permissionType
        }));
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Permisos obtenidos exitosamente.",
            permissions: responseDTOs
        });
    } catch(error) {
        next(error);
    }
};

module.exports = { create, remove, restore, getAll };