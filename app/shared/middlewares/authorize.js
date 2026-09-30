const dbConnection = require('../utils/index.js');
const Role = dbConnection.Role;
const Permission = dbConnection.Permission;
const { ApiError } = require('../utils/errors.js');
const ADMIN_ROLE_NAME = 'Administrador';

//utiliza los claims en el JWT inyectados al firmar el token en el payload
const authorize = (permissionName) => {
    return async (req, res, next) => {
        try {
            if(!req.user) return next(new ApiError('Acceso denegado. Token de sesion no proporcionado.', "UNAUTHENTICATED"));
            if(req.user.roleName === ADMIN_ROLE_NAME) return next();

            const role = await Role.findByPk(req.user.roleId, {
                include: [{ model: Permission, through: { attributes: [] }, required: false }]
            });
            if(!role) return next(new ApiError('El rol asociado a la sesion ya no existe.', "UNAUTHORIZED_ACCESS"));

            const hasPermission = role.Permissions.some(permission => permission.permissionName === permissionName);
            if(!hasPermission) return next(new ApiError('No tiene permisos para realizar esta accion.', "UNAUTHORIZED_ACCESS"));

            next();
        } catch(err) {
            next(err);
        }
    };
};

module.exports = authorize;
