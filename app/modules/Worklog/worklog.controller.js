const worklogService = require('./worklog.service.js');

const getAll = async (req, res, next) => {
    try {
        const { userId, method, entity, statusCode } = req.query;
        const logs = await worklogService.getAll({ userId, method, entity, statusCode });

        return res.status(200).json({
            success: true,
            status: 200,
            message: "Registros de auditoria obtenidos exitosamente.",
            worklogs: logs
        });
    } catch(error) {
        next(error);
    }
}

const getWorklogById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const log = await worklogService.getById(id);

        return res.status(200).json({
            success: true,
            status: 200,
            message: "Registro de auditoria encontrado exitosamente.",
            worklog: log
        });
    } catch(error) {
        next(error);
    }
}

module.exports = { getAllWorklogs: getAll, getWorklogById };
