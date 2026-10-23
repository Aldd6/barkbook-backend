const dbConnection = require('../utils/index.js');
const Role = dbConnection.Role;
const Permission = dbConnection.Permission;
const { ApiError } = require('../utils/errors.js');
const { PERMISSIONS_ARRAY } = require('../constants/enums.js');
const ADMIN_ROLE_NAME = 'Administrador';

const assertKnownPermission = (permissionName) => {
    if(!PERMISSIONS_ARRAY.includes(permissionName)) {
        throw new Error(`Permiso desconocido en authorize: "${permissionName}". Usa una constante de PERMISSIONS.`);
    }
};

const assertPermission = async (user, permissionName) => {
    if(user.roleName === ADMIN_ROLE_NAME) return;

    const role = await Role.findByPk(user.roleId, {
        include: [{ model: Permission, through: { attributes: [] }, required: false }]
    });
    if(!role) throw new ApiError('El rol asociado a la sesion ya no existe.', "UNAUTHORIZED_ACCESS");

    const hasPermission = role.Permissions.some(permission => permission.permissionName === permissionName);
    if(!hasPermission) throw new ApiError('No tiene permisos para realizar esta accion.', "UNAUTHORIZED_ACCESS");
};

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

const authorizeAny = (...permissionNames) => {
    permissionNames.forEach(assertKnownPermission);
    return async (req, res, next) => {
        try {
            if(!req.user) return next(new ApiError('Acceso denegado. Token de sesion no proporcionado.', "UNAUTHENTICATED"));
            for(const permissionName of permissionNames) {
                try {
                    await assertPermission(req.user, permissionName);
                    return next();
                } catch(err) {
                    if(err.flag !== "UNAUTHORIZED_ACCESS") throw err;
                }
            }
            next(new ApiError('No tiene permisos para realizar esta accion.', "UNAUTHORIZED_ACCESS"));
        } catch(err) {
            next(err);
        }
    };
};

const authorizeFields = (fields, permissionName) => {
    assertKnownPermission(permissionName);
    return async (req, res, next) => {
        try {
            const sentFields = fields.filter(field => req.body?.[field] !== undefined);
            if(sentFields.length === 0) return next();
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
authorize.authorizeFields = authorizeFields;
authorize.authorizeAny = authorizeAny;
authorize.ADMIN_ROLE_NAME = ADMIN_ROLE_NAME;

module.exports = authorize;
