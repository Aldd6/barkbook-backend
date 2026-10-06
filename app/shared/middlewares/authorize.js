const dbConnection = require('../utils/index.js');
const Role = dbConnection.Role;
const Permission = dbConnection.Permission;
const { ApiError } = require('../utils/errors.js');
const { PERMISSIONS_ARRAY } = require('../constants/enums.js');
const ADMIN_ROLE_NAME = 'Administrador';

// Falla al cargar las rutas si se usa un permiso que no existe en PERMISSIONS:
// de lo contrario la ruta responderia 403 a todos menos al Administrador.
const assertKnownPermission = (permissionName) => {
    if(!PERMISSIONS_ARRAY.includes(permissionName)) {
        throw new Error(`Permiso desconocido en authorize: "${permissionName}". Usa una constante de PERMISSIONS.`);
    }
};

// Lanza ApiError si el usuario de la sesion no tiene el permiso indicado.
const assertPermission = async (user, permissionName) => {
    if(user.roleName === ADMIN_ROLE_NAME) return;

    const role = await Role.findByPk(user.roleId, {
        include: [{ model: Permission, through: { attributes: [] }, required: false }]
    });
    if(!role) throw new ApiError('El rol asociado a la sesion ya no existe.', "UNAUTHORIZED_ACCESS");

    const hasPermission = role.Permissions.some(permission => permission.permissionName === permissionName);
    if(!hasPermission) throw new ApiError('No tiene permisos para realizar esta accion.', "UNAUTHORIZED_ACCESS");
};

//utiliza los claims en el JWT inyectados al firmar el token en el payload
const authorize = (permissionName) => {
    assertKnownPermission(permissionName);
    return async (req, res, next) => {
        try {
            if(!req.user) return next(new ApiError('Acceso denegado. Token de sesion no proporcionado.', "UNAUTHENTICATED"));
            await assertPermission(req.user, permissionName);
            next();
        } catch(err) {
            next(err);
        }
    };
};

authorize.assertPermission = assertPermission;
authorize.assertKnownPermission = assertKnownPermission;

module.exports = authorize;
