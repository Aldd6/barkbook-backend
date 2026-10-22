// Fechas de negocio en la zona horaria del hotel. new Date().toISOString() da
// la fecha en UTC: en Guatemala (UTC-6) desde las 18:00 ya seria "manana".
const DEFAULT_TIMEZONE = 'America/Guatemala';

// Fecha actual (YYYY-MM-DD) en APP_TIMEZONE. Se lee en cada llamada para que
// tome el valor del .env aunque este modulo se cargue antes que dotenv.
const todayISO = () => new Intl.DateTimeFormat('en-CA', {
    timeZone: process.env.APP_TIMEZONE || DEFAULT_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
}).format(new Date());

module.exports = { todayISO };
