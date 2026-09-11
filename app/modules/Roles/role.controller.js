const roleService = require('./role.service.js');
const RoleResponseDTO = require('./DTOs/role-response.js');
const RolePermissionsResponseDTO = require('./DTOs/role-permissions-response.js');
const CreateRoleDTO = require('./DTOs/create-role.js');
const UpdateRolePermissionsDTO = require('./DTOs/update-role-permissions.js');

const create = async (req, res, next) => {
   try {
      const requestDTO = CreateRoleDTO.parse(req.body);
      const newRole = await roleService.create(requestDTO);
      const responseDTO = RoleResponseDTO.parse({
         id: newRole.id,
         name: newRole.roleName
      });
      return res.status(201).json({
         success: true,
         status: 201,
         message: "Rol creado exitosamente.",
         rol: responseDTO
      });
   } catch(error) {
      next(error);
   }
};

const remove = async (req, res, next) => {
   try {
      const { id } = req.params;
      const role = await roleService.remove(id);
      const responseDTO = RoleResponseDTO.parse({
         id: role.id,
         name: role.roleName,
         permissions: role.Permissions
      });
      return res.status(200).json({
         success: true,
         status: 200,
         message: "Rol eliminado exitosamente",
         rol: responseDTO
      });
   } catch(error) {
      next(error);
   }
};

const restore = async (req, res, next) => {
   try {
      const { id } = req.params;
      const role = await roleService.restore(id);
      const responseDTO = RoleResponseDTO.parse({
         id: role.id,
         name: role.roleName,
         permissions: role.Permissions
      });
      return res.status(200).json({
         success: true,
         status: 200,
         message: "Rol restaurado exitosamente.",
         rol: responseDTO
      });
   } catch(error) {
      next(error);
   }
};

const updatePermissions = async (req, res, next) => {
   try {
      const requestDTO = UpdateRolePermissionsDTO.parse(req.body);
      const role = await roleService.updatePermissions(requestDTO);
      const responseDTO = RoleResponseDTO.parse({
         id: role.id,
         name: role.roleName,
         permissions: role.Permissions
      });
      return res.status(200).json({
         success: true,
         status: 200,
         message: "Permisos del rol actualizados correctamente.",
         rol: responseDTO
      });
   } catch(error) {
      next(error);
   }
};

const getAll = async (req, res, next) => {
   try {
      const roles = await roleService.getAll();
      const responseDTO = roles.map(r => RoleResponseDTO.parse({
         id: r.id,
         name: r.roleName,
         permissions: r.Permissions
      }));
      return res.status(200).json({
         success: true,
         status: 200,
         message: "Roles encontrados exitosamente.",
         roles: responseDTO
      });
   } catch(error) {
      next(error);
   }
};

const getById = async (req, res, next) => {
   try {
      const { id } = req.params;
      const role = await roleService.getById(id);
      const responseDTO = RoleResponseDTO.parse({
         id: role.id,
         name: role.roleName,
         permissions: role.Permissions
      });
      return res.status(200).json({
         success: true,
         status: 200,
         message: "Rol encontrado exitosamente.",
         rol: responseDTO
      });
   } catch(error) {
      next(error);
   }
};

const getAllPermissionsAssociatedToRole = async (req, res, next) => {
   try {
      const { id } = req.params;
      const rolePermissions = await roleService.getAllPermissionsAssociatedToRole(id);
      const responseDTO = RolePermissionsResponseDTO.parse({
         permissions: rolePermissions
      });
      return res.status(200).json({
         success: true,
         status: 200,
         message: "Permisos de rol encontrados exitosamente.",
         permisos: responseDTO
      });
   } catch(error) {
      next(error);
   }
};

module.exports = { create, remove, restore, updatePermissions, getAll, getById, getAllPermissionsAssociatedToRole}