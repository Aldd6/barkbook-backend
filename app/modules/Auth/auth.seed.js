require('dotenv').config({ path: `.env.${process.env.NODE_ENV || 'development'}` });
const dbConnection = require('../../shared/utils/index.js');
const { Role, Permission, sequelize } = dbConnection;
const { TYPE_TRANSACTION, PERMISSIONS } = require('../../shared/constants/enums.js');

// Catalogo de permisos base del sistema. Los nombres viven en PERMISSIONS
// (enums.js) y son los mismos que reciben los authorize() de cada *.routes.js.
// "Gestionar <recurso>" cubre crear, editar, archivar y restaurar el recurso.
const permissionCatalog = [
    // Administracion del propio RBAC, cuentas y personal: solo Administrador.
    { permissionName: PERMISSIONS.GESTIONAR_ROLES_PERMISOS, permissionType: TYPE_TRANSACTION.WRITE },
    { permissionName: PERMISSIONS.GESTIONAR_USUARIOS, permissionType: TYPE_TRANSACTION.WRITE },
    { permissionName: PERMISSIONS.GESTIONAR_EMPLEADOS, permissionType: TYPE_TRANSACTION.WRITE },
    // Configuracion de sedes, habitaciones y catalogo de servicios: solo Administrador.
    { permissionName: PERMISSIONS.GESTIONAR_SEDES, permissionType: TYPE_TRANSACTION.WRITE },
    { permissionName: PERMISSIONS.GESTIONAR_TIPOS_HABITACION, permissionType: TYPE_TRANSACTION.WRITE },
    { permissionName: PERMISSIONS.GESTIONAR_HABITACIONES_SEDE, permissionType: TYPE_TRANSACTION.WRITE },
    { permissionName: PERMISSIONS.GESTIONAR_CATALOGO_SERVICIOS, permissionType: TYPE_TRANSACTION.WRITE },
    // Habitaciones fisicas (RoomInventory) de una sede: Gerente.
    { permissionName: PERMISSIONS.GESTIONAR_HABITACIONES_FISICAS, permissionType: TYPE_TRANSACTION.WRITE },
    // Cambio de estado/activacion de una habitacion fisica (ej. limpieza -> disponible).
    { permissionName: PERMISSIONS.ACTUALIZAR_ESTADO_HABITACIONES, permissionType: TYPE_TRANSACTION.UPDATE },
    // Recursos propios del cliente (un Cliente solo opera los suyos, ver ownership.js).
    { permissionName: PERMISSIONS.GESTIONAR_MASCOTAS, permissionType: TYPE_TRANSACTION.WRITE },
    { permissionName: PERMISSIONS.GESTIONAR_CONTACTOS_EMERGENCIA, permissionType: TYPE_TRANSACTION.WRITE },
    { permissionName: PERMISSIONS.GESTIONAR_RESERVACIONES, permissionType: TYPE_TRANSACTION.WRITE },
    // Operacion de reservas.
    { permissionName: PERMISSIONS.VER_RESERVAS_DIA, permissionType: TYPE_TRANSACTION.READ },
    { permissionName: PERMISSIONS.CONSULTAR_CUENTA_RESERVACION, permissionType: TYPE_TRANSACTION.READ },
    { permissionName: PERMISSIONS.HACER_CHECK_IN, permissionType: TYPE_TRANSACTION.UPDATE },
    { permissionName: PERMISSIONS.HACER_CHECK_OUT, permissionType: TYPE_TRANSACTION.UPDATE },
    { permissionName: PERMISSIONS.APLICAR_PAGOS_MOSTRADOR, permissionType: TYPE_TRANSACTION.WRITE },
    { permissionName: PERMISSIONS.CARGAR_SERVICIOS_RESERVACION, permissionType: TYPE_TRANSACTION.WRITE },
    // Reportes, informes, medicacion y alimentacion: funcionalidad aun no implementada, se deja el permiso listo.
    { permissionName: PERMISSIONS.VER_REPORTES_ESTADO_MASCOTA, permissionType: TYPE_TRANSACTION.READ },
    { permissionName: PERMISSIONS.SUBIR_REPORTES_ESTADO_MASCOTA, permissionType: TYPE_TRANSACTION.WRITE },
    { permissionName: PERMISSIONS.SUBIR_INFORMES_SERVICIOS, permissionType: TYPE_TRANSACTION.WRITE },
    { permissionName: PERMISSIONS.APLICAR_MEDICACION, permissionType: TYPE_TRANSACTION.WRITE },
    { permissionName: PERMISSIONS.SUBIR_INFORMES_LIMPIEZA, permissionType: TYPE_TRANSACTION.WRITE },
    { permissionName: PERMISSIONS.APLICAR_ALIMENTACION, permissionType: TYPE_TRANSACTION.WRITE }
];

// Nombres anteriores de permisos que ya pueden existir en una BD desplegada.
// Se renombra la fila (en vez de crear una nueva) para conservar sus
// asignaciones en Role_Permission, incluidas las de roles creados por la API.
const legacyPermissionNames = {
    'Crear usuarios': PERMISSIONS.GESTIONAR_USUARIOS,
    'Crear perfiles de empleados': PERMISSIONS.GESTIONAR_EMPLEADOS,
    'Crear sedes': PERMISSIONS.GESTIONAR_SEDES,
    'Crear tipos de habitacion': PERMISSIONS.GESTIONAR_TIPOS_HABITACION,
    'Crear habitaciones fisicas': PERMISSIONS.GESTIONAR_HABITACIONES_FISICAS,
    'Crear mascotas': PERMISSIONS.GESTIONAR_MASCOTAS,
    'Crear reservaciones': PERMISSIONS.GESTIONAR_RESERVACIONES
};

// Roles por defecto y los permisos que le corresponden a cada uno.
// Administrador se resuelve aparte: siempre recibe el catalogo completo (ademas,
// authorize() lo deja pasar cualquier chequeo sin siquiera consultar esta tabla).
const rolePermissions = {
    'Administrador': null, // null = todos los permisos del catalogo
    'Gerente': [
        PERMISSIONS.VER_RESERVAS_DIA,
        PERMISSIONS.GESTIONAR_HABITACIONES_FISICAS,
        PERMISSIONS.ACTUALIZAR_ESTADO_HABITACIONES
    ],
    'Recepcionista': [
        PERMISSIONS.VER_RESERVAS_DIA,
        PERMISSIONS.HACER_CHECK_IN,
        PERMISSIONS.HACER_CHECK_OUT,
        PERMISSIONS.APLICAR_PAGOS_MOSTRADOR,
        PERMISSIONS.GESTIONAR_CONTACTOS_EMERGENCIA,
        PERMISSIONS.CONSULTAR_CUENTA_RESERVACION,
        PERMISSIONS.ACTUALIZAR_ESTADO_HABITACIONES
    ],
    'Cuidador': [
        PERMISSIONS.SUBIR_REPORTES_ESTADO_MASCOTA,
        PERMISSIONS.SUBIR_INFORMES_SERVICIOS,
        PERMISSIONS.APLICAR_MEDICACION
    ],
    'Operador': [
        PERMISSIONS.SUBIR_INFORMES_LIMPIEZA,
        PERMISSIONS.APLICAR_ALIMENTACION,
        PERMISSIONS.ACTUALIZAR_ESTADO_HABITACIONES
    ],
    // Rol usado por Auth.signup para clientes finales.
    'Cliente': [
        PERMISSIONS.GESTIONAR_CONTACTOS_EMERGENCIA,
        PERMISSIONS.CONSULTAR_CUENTA_RESERVACION,
        PERMISSIONS.GESTIONAR_MASCOTAS,
        PERMISSIONS.GESTIONAR_RESERVACIONES,
        PERMISSIONS.CARGAR_SERVICIOS_RESERVACION,
        PERMISSIONS.VER_REPORTES_ESTADO_MASCOTA
    ]
};

const renameLegacyPermissions = async (transaction) => {
    let renamed = 0;
    for(const [legacyName, currentName] of Object.entries(legacyPermissionNames)) {
        const legacy = await Permission.findOne({ where: { permissionName: legacyName }, paranoid: false, transaction });
        if(!legacy) continue;

        const current = await Permission.findOne({ where: { permissionName: currentName }, paranoid: false, transaction });
        if(current) {
            console.warn(`[SEED] Existen "${legacyName}" y "${currentName}" a la vez; no se renombra. Reasigne y archive "${legacyName}" manualmente.`);
            continue;
        }
        await legacy.update({ permissionName: currentName }, { transaction });
        renamed++;
    }
    return renamed;
}

// Si se encuentra archivado: con fullSync se restaura; sin fullSync se respeta
// la decision del administrador y se omite.
const findOrCreateActive = async (Model, where, defaults, fullSync, transaction) => {
    const existing = await Model.findOne({ where, paranoid: false, transaction });
    if(!existing) return { record: await Model.create(defaults, { transaction }), created: true };
    if(existing.isSoftDeleted()) {
        if(!fullSync) return { record: null, created: false };
        await existing.restore({ transaction });
    }
    return { record: existing, created: false };
}

// fullSync = true (npm run seed:auth): el seed es la fuente de verdad, restaura
// lo archivado y deja cada rol por defecto exactamente con su lista.
// fullSync = false (arranque del servidor): solo agrega lo que falta. Los roles
// nuevos reciben su lista completa y los existentes solo los permisos creados en
// esta corrida, sin deshacer cambios hechos por el administrador desde la API.
const seedAuth = async ({ fullSync = true } = {}) => {
    return await sequelize.transaction(async (transaction) => {
        const renamedCount = await renameLegacyPermissions(transaction);

        let permissionCount = 0;
        const permissionsByName = {};
        const newPermissionNames = new Set();
        for(const permissionDef of permissionCatalog) {
            const { record, created } = await findOrCreateActive(Permission, { permissionName: permissionDef.permissionName }, permissionDef, fullSync, transaction);
            if(!record) continue;
            if(created) {
                permissionCount++;
                newPermissionNames.add(permissionDef.permissionName);
            }
            permissionsByName[permissionDef.permissionName] = record;
        }

        let roleCount = 0;
        for(const [roleName, defaultNames] of Object.entries(rolePermissions)) {
            const { record: role, created } = await findOrCreateActive(Role, { roleName }, { roleName }, fullSync, transaction);
            if(!role) continue;
            if(created) roleCount++;

            const names = (defaultNames ?? Object.keys(permissionsByName)).filter(name => permissionsByName[name]);
            if(fullSync) {
                // setPermissions sincroniza el rol exactamente a esta lista.
                await role.setPermissions(names.map(name => permissionsByName[name].id), { transaction });
            } else {
                const toAdd = created ? names : names.filter(name => newPermissionNames.has(name));
                if(toAdd.length > 0) await role.addPermissions(toAdd.map(name => permissionsByName[name].id), { transaction });
            }
        }

        return { roleCount, permissionCount, renamedCount };
    });
};

const run = async () => {
    try {
        const { roleCount, permissionCount, renamedCount } = await seedAuth({ fullSync: true });
        console.log(`Seed completado: ${roleCount} rol(es) nuevo(s), ${permissionCount} permiso(s) nuevo(s), ${renamedCount} permiso(s) renombrado(s).`);
    } catch(err) {
        console.error(`Error al ejecutar el seed de Auth: ${err.message}`);
        process.exitCode = 1;
    } finally {
        await sequelize.close();
    }
};

// Ejecutado directamente (npm run seed:auth) corre la sincronizacion completa;
// al importarse (server.js) solo expone seedAuth.
if(require.main === module) run();

module.exports = { seedAuth };
