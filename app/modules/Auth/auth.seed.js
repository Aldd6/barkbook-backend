require('dotenv').config({ path: `.env.${process.env.NODE_ENV || 'development'}` });
const dbConnection = require('../../shared/utils/index.js');
const { Role, Permission, sequelize } = dbConnection;
const { TYPE_TRANSACTION, PERMISSIONS } = require('../../shared/constants/enums.js');

const permissionCatalog = [
    { permissionName: PERMISSIONS.GESTIONAR_ROLES_PERMISOS, permissionType: TYPE_TRANSACTION.WRITE },
    { permissionName: PERMISSIONS.GESTIONAR_USUARIOS, permissionType: TYPE_TRANSACTION.WRITE },
    { permissionName: PERMISSIONS.GESTIONAR_EMPLEADOS, permissionType: TYPE_TRANSACTION.WRITE },
    { permissionName: PERMISSIONS.GESTIONAR_SEDES, permissionType: TYPE_TRANSACTION.WRITE },
    { permissionName: PERMISSIONS.GESTIONAR_TIPOS_HABITACION, permissionType: TYPE_TRANSACTION.WRITE },
    { permissionName: PERMISSIONS.GESTIONAR_HABITACIONES_SEDE, permissionType: TYPE_TRANSACTION.WRITE },
    { permissionName: PERMISSIONS.GESTIONAR_CATALOGO_SERVICIOS, permissionType: TYPE_TRANSACTION.WRITE },
    { permissionName: PERMISSIONS.GESTIONAR_HABITACIONES_FISICAS, permissionType: TYPE_TRANSACTION.WRITE },
    { permissionName: PERMISSIONS.ACTUALIZAR_ESTADO_HABITACIONES, permissionType: TYPE_TRANSACTION.UPDATE },
    { permissionName: PERMISSIONS.GESTIONAR_MASCOTAS, permissionType: TYPE_TRANSACTION.WRITE },
    { permissionName: PERMISSIONS.GESTIONAR_CONTACTOS_EMERGENCIA, permissionType: TYPE_TRANSACTION.WRITE },
    { permissionName: PERMISSIONS.GESTIONAR_RESERVACIONES, permissionType: TYPE_TRANSACTION.WRITE },
    { permissionName: PERMISSIONS.VER_RESERVAS_DIA, permissionType: TYPE_TRANSACTION.READ },
    { permissionName: PERMISSIONS.CONSULTAR_CUENTA_RESERVACION, permissionType: TYPE_TRANSACTION.READ },
    { permissionName: PERMISSIONS.HACER_CHECK_IN, permissionType: TYPE_TRANSACTION.UPDATE },
    { permissionName: PERMISSIONS.HACER_CHECK_OUT, permissionType: TYPE_TRANSACTION.UPDATE },
    { permissionName: PERMISSIONS.APLICAR_PAGOS_MOSTRADOR, permissionType: TYPE_TRANSACTION.WRITE },
    { permissionName: PERMISSIONS.CARGAR_SERVICIOS_RESERVACION, permissionType: TYPE_TRANSACTION.WRITE },
    { permissionName: PERMISSIONS.SOLICITAR_CANCELACION_RESERVACION, permissionType: TYPE_TRANSACTION.WRITE },
    { permissionName: PERMISSIONS.GESTIONAR_CANCELACIONES_RESERVACION, permissionType: TYPE_TRANSACTION.UPDATE },
    { permissionName: PERMISSIONS.VER_REPORTES_ESTADO_MASCOTA, permissionType: TYPE_TRANSACTION.READ },
    { permissionName: PERMISSIONS.SUBIR_REPORTES_ESTADO_MASCOTA, permissionType: TYPE_TRANSACTION.WRITE },
    { permissionName: PERMISSIONS.SUBIR_INFORMES_SERVICIOS, permissionType: TYPE_TRANSACTION.WRITE },
    { permissionName: PERMISSIONS.APLICAR_MEDICACION, permissionType: TYPE_TRANSACTION.WRITE },
    { permissionName: PERMISSIONS.SUBIR_INFORMES_LIMPIEZA, permissionType: TYPE_TRANSACTION.WRITE },
    { permissionName: PERMISSIONS.APLICAR_ALIMENTACION, permissionType: TYPE_TRANSACTION.WRITE }
];

const legacyPermissionNames = {
    'Crear usuarios': PERMISSIONS.GESTIONAR_USUARIOS,
    'Crear perfiles de empleados': PERMISSIONS.GESTIONAR_EMPLEADOS,
    'Crear sedes': PERMISSIONS.GESTIONAR_SEDES,
    'Crear tipos de habitacion': PERMISSIONS.GESTIONAR_TIPOS_HABITACION,
    'Crear habitaciones fisicas': PERMISSIONS.GESTIONAR_HABITACIONES_FISICAS,
    'Crear mascotas': PERMISSIONS.GESTIONAR_MASCOTAS,
    'Crear reservaciones': PERMISSIONS.GESTIONAR_RESERVACIONES
};

const rolePermissions = {
    'Administrador': null,
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
        PERMISSIONS.ACTUALIZAR_ESTADO_HABITACIONES,
        PERMISSIONS.GESTIONAR_CANCELACIONES_RESERVACION
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
    'Cliente': [
        PERMISSIONS.GESTIONAR_CONTACTOS_EMERGENCIA,
        PERMISSIONS.CONSULTAR_CUENTA_RESERVACION,
        PERMISSIONS.GESTIONAR_MASCOTAS,
        PERMISSIONS.GESTIONAR_RESERVACIONES,
        PERMISSIONS.CARGAR_SERVICIOS_RESERVACION,
        PERMISSIONS.VER_REPORTES_ESTADO_MASCOTA,
        PERMISSIONS.SOLICITAR_CANCELACION_RESERVACION
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

const findOrCreateActive = async (Model, where, defaults, fullSync, transaction) => {
    const existing = await Model.findOne({ where, paranoid: false, transaction });
    if(!existing) return { record: await Model.create(defaults, { transaction }), created: true };
    if(existing.isSoftDeleted()) {
        if(!fullSync) return { record: null, created: false };
        await existing.restore({ transaction });
    }
    return { record: existing, created: false };
}

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

if(require.main === module) run();

module.exports = { seedAuth };
