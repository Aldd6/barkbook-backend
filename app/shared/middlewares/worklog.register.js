const worklogService = require('../../modules/Worklog/worklog.service.js');
const CreateWorklogDTO = require('../../modules/Worklog/DTOs/create-worklog.js');

const registerWorklog = (entity) => (req, res, next) => {
    const originalJson = res.json.bind(res);
    let responseBody;
    res.json = (body) => {
        responseBody = body;
        return originalJson(body);
    };

    res.on('finish', () => {
        const detail = res.statusCode >= 400 ? responseBody?.message : undefined;

        const result = CreateWorklogDTO.safeParse({
            userId: req.user?.id,
            method: req.method,
            endpoint: req.originalUrl,
            entity,
            statusCode: res.statusCode,
            detail,
            ipAddress: req.ip
        });

        if(!result.success) {
            console.log(`[WORKLOG]: Datos invalidos, no se registro la transaccion. ${result.error.message}`);
            return;
        }

        worklogService.create(result.data).catch(err => {
            console.log(`[WORKLOG]: No se pudo registrar la transaccion. ${err.message}`);
        });
    });

    next();
}

module.exports = registerWorklog;
