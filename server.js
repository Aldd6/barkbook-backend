const app = require('./app.js');
const db = require('./app/shared/utils/index.js');
const { startBookingCronJobs, stopBookingCronJobs } = require('./app/modules/Booking/booking.cron.js');

const PORT = process.env.PORT || 3000;

db.sequelize.authenticate()
    .then(() => {
        console.log('[DB] Conexion a la base de datos establecida correctamente.');
        const forceSync = false;
        db.sequelize.sync({force: forceSync}).then(() => {
            console.log(`[DB] Sync con la base de datos: ${forceSync}`);
        });
        app.listen(PORT, () => {
            console.log(`[SERVER] Servidor corriendo en el puerto ${PORT}.`);
        });
        startBookingCronJobs();
    })
    .catch((err) => {
        console.error('[DB] No se pudo conectar a la base de datos:', err.message);
        process.exit(1);
    });

// detiene el cron limpiamente para no dejar el proceso colgado al cerrar el servidor
process.on('SIGTERM', stopBookingCronJobs);
process.on('SIGINT', stopBookingCronJobs);
