const app = require('./app.js');
const db = require('./app/shared/utils/index.js');
const { seedAuth } = require('./app/modules/Auth/auth.seed.js');
const { startBookingCronJobs, stopBookingCronJobs } = require('./app/modules/Booking/booking.cron.js');

const PORT = process.env.PORT || 3000;

db.sequelize.authenticate()
    .then(() => {
        console.log('[DB] Conexion a la base de datos establecida correctamente.');
        const forceSync = false;
        db.sequelize.sync({force: forceSync}).then(async () => {
            console.log(`[DB] Sync con la base de datos: ${forceSync}`);
            const { roleCount, permissionCount, renamedCount } = await seedAuth({ fullSync: false });
            console.log(`[SEED] Roles y permisos base: ${roleCount} rol(es) nuevo(s), ${permissionCount} permiso(s) nuevo(s), ${renamedCount} renombrado(s).`);
        }).catch((err) => {
            console.error('[SEED] No se pudieron generar los roles y permisos base:', err.message);
        });
        app.listen(PORT, () => {
            console.log(`[SERVER] Servidor corriendo en el puerto ${PORT}.`);
        });
        //startBookingCronJobs();
    })
    .catch((err) => {
        console.error('[DB] No se pudo conectar a la base de datos:', err.message);
        process.exit(1);
    });

//process.on('SIGTERM', stopBookingCronJobs);
//process.on('SIGINT', stopBookingCronJobs);
