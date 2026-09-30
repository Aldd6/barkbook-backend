require('dotenv').config({ path: `.env.${process.env.NODE_ENV || 'development'}` });
const dbConnection = require('../../shared/utils/index.js');
const { Role, Permission, sequelize } = dbConnection;
const { TYPE_TRANSACTION } = require('../../shared/constants/enums.js');

// Catalogo de permisos base del sistema. La clave es el mismo permissionName
// (unico) usado luego en rolePermissions para asignarlo a cada rol, y el que
// se pasa a los middlewares authorize('...') en cada *.routes.js.
const permissionCatalog = [
    // Roles y Permisos: modulo de administracion del propio RBAC, solo Administrador.
    { permissionName: 'Gestionar roles y permisos', permissionType: TYPE_TRANSACTION.WRITE },
    // Alta de cuentas y personal: solo Administrador.
    { permissionName: 'Crear usuarios', permissionType: TYPE_TRANSACTION.WRITE },
    { permissionName: 'Crear perfiles de empleados', permissionType: TYPE_TRANSACTION.WRITE },
    // Configuracion de sedes y catalogo de habitaciones: solo Administrador.
    { permissionName: 'Crear sedes', permissionType: TYPE_TRANSACTION.WRITE },
    { permissionName: 'Crear tipos de habitacion', permissionType: TYPE_TRANSACTION.WRITE },
    // Alta de habitaciones fisicas (RoomInventory) en una sede: Gerente.
    { permissionName: 'Crear habitaciones fisicas', permissionType: TYPE_TRANSACTION.WRITE },
    { permissionName: 'Ver reservas del dia', permissionType: TYPE_TRANSACTION.READ },
    // Check-in/check-out de reservas: funcionalidad aun no implementada en Booking, se deja el permiso listo.
    { permissionName: 'Hacer check-in de reservas', permissionType: TYPE_TRANSACTION.UPDATE },
    { permissionName: 'Hacer check-out de reservas', permissionType: TYPE_TRANSACTION.UPDATE },
    { permissionName: 'Aplicar pagos cobrados en mostrador', permissionType: TYPE_TRANSACTION.WRITE },
    { permissionName: 'Gestionar contactos de emergencia', permissionType: TYPE_TRANSACTION.WRITE },
    { permissionName: 'Consultar cuenta de reservacion', permissionType: TYPE_TRANSACTION.READ },
    { permissionName: 'Crear mascotas', permissionType: TYPE_TRANSACTION.WRITE },
    { permissionName: 'Crear reservaciones', permissionType: TYPE_TRANSACTION.WRITE },
    // Cargar servicios a una reserva y ver reportes de estado: funcionalidad aun no implementada, se deja el permiso listo.
    { permissionName: 'Cargar servicios a reservacion', permissionType: TYPE_TRANSACTION.WRITE },
    { permissionName: 'Ver reportes de estado de mascota', permissionType: TYPE_TRANSACTION.READ },
    // Subir reportes de estado, informes de servicios y aplicar medicacion: funcionalidad aun no implementada, se deja el permiso listo.
    { permissionName: 'Subir reportes de estado de mascota', permissionType: TYPE_TRANSACTION.WRITE },
    { permissionName: 'Subir informes de servicios completados', permissionType: TYPE_TRANSACTION.WRITE },
    { permissionName: 'Aplicar medicacion requerida a mascotas', permissionType: TYPE_TRANSACTION.WRITE },
    { permissionName: 'Subir informes de limpieza de habitaculos', permissionType: TYPE_TRANSACTION.WRITE },
    { permissionName: 'Aplicar alimentacion a mascotas', permissionType: TYPE_TRANSACTION.WRITE }
];

// Roles por defecto y los permisos que le corresponden a cada uno (por permissionName).
// Administrador se resuelve aparte: siempre recibe el catalogo completo (ademas,
// authorize() lo deja pasar cualquier chequeo sin siquiera consultar esta tabla).
const rolePermissions = {
    'Administrador': null, // null = todos los permisos del catalogo
    'Gerente': [
        'Ver reservas del dia',
        'Crear habitaciones fisicas'
    ],
    'Recepcionista': [
        'Ver reservas del dia',
        'Hacer check-in de reservas',
        'Hacer check-out de reservas',
        'Aplicar pagos cobrados en mostrador',
        'Gestionar contactos de emergencia',
        'Consultar cuenta de reservacion'
    ],
    'Cuidador': [
        'Subir reportes de estado de mascota',
        'Subir informes de servicios completados',
        'Aplicar medicacion requerida a mascotas'
    ],
    'Operador': [
        'Subir informes de limpieza de habitaculos',
        'Aplicar alimentacion a mascotas'
    ],
    // Rol usado por Auth.signup para clientes finales.
    'Cliente': [
        'Gestionar contactos de emergencia',
        'Consultar cuenta de reservacion',
        'Crear mascotas',
        'Crear reservaciones',
        'Cargar servicios a reservacion',
        'Ver reportes de estado de mascota'
    ]
};

const seed = async () => {
    const transaction = await sequelize.transaction();
    try {
        let roleCount = 0;
        let permissionCount = 0;

        const permissionsByName = {};
        for(const permissionDef of permissionCatalog) {
            const [permission, created] = await Permission.findOrCreate({
                where: { permissionName: permissionDef.permissionName },
                defaults: permissionDef,
                transaction
            });
            if(created) permissionCount++;
            permissionsByName[permissionDef.permissionName] = permission;
        }

        const allPermissionIds = Object.values(permissionsByName).map(permission => permission.id);

        for(const roleName of Object.keys(rolePermissions)) {
            const [role, created] = await Role.findOrCreate({
                where: { roleName },
                transaction
            });
            if(created) roleCount++;

            const permissionNames = rolePermissions[roleName];
            const permissionIds = permissionNames === null
                ? allPermissionIds
                : permissionNames.map(name => permissionsByName[name].id);

            // setPermissions sincroniza el rol exactamente a esta lista (agrega lo
            // que falte y quita lo que ya no deberia tener), para que el seed sea
            // la fuente de verdad de los roles por defecto.
            await role.setPermissions(permissionIds, { transaction });
        }

        await transaction.commit();
        console.log(`Seed completado: ${roleCount} rol(es) nuevo(s), ${permissionCount} permiso(s) nuevo(s) insertados.`);
    } catch(err) {
        await transaction.rollback();
        console.error(`Error al ejecutar el seed de Auth: ${err.message}`);
        process.exitCode = 1;
    } finally {
        await sequelize.close();
    }
};

seed();
