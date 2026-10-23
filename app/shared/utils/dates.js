const DEFAULT_TIMEZONE = 'America/Guatemala';

const todayISO = () => new Intl.DateTimeFormat('en-CA', {
    timeZone: process.env.APP_TIMEZONE || DEFAULT_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
}).format(new Date());

module.exports = { todayISO };
