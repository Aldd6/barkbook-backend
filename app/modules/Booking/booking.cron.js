const cron = require('node-cron');
const bookingService = require('./booking.service.js');

// Cada 15 minutos.
const CRON_EXPRESSION = '*/15 * * * *';

let task = null;

const startBookingCronJobs = () => {
    if(task) return task; // ya esta corriendo, no registrar el job dos veces

    task = cron.schedule(CRON_EXPRESSION, async () => {
        try {
            const cancelled = await bookingService.sweepExpiredBookings();
            if(cancelled.length > 0) {
                console.log(`[CRON booking]: ${cancelled.length} reserva(s) cancelada(s) automaticamente por vencimiento de pago.`);
            }
        } catch(err) {
            console.log(`[CRON booking]: Error al ejecutar el barrido de reservas vencidas. ${err.message}`);
        }
    }, {
        name: 'booking-expired-sweep',
        noOverlap: true // si un barrido tarda mas de 15 min, no se solapa con el siguiente
    });

    console.log(`[CRON booking]: Barrido de reservas vencidas programado (${CRON_EXPRESSION}).`);
    return task;
}

const stopBookingCronJobs = () => {
    if(task) {
        task.stop();
        task = null;
    }
}

module.exports = { startBookingCronJobs, stopBookingCronJobs };
