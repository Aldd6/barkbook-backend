const dbConnection = require('../../shared/utils/index.js');
const Worklog = dbConnection.Worklog;
const { ApiError } = require('../../shared/utils/errors.js');

const create = async (CreateWorklogDTO) => {
    const newLog = await Worklog.create(CreateWorklogDTO);
    return newLog;
}

const getById = async (id) => {
    const log = await Worklog.findByPk(id);
    if(!log) throw new ApiError(`El registro de auditoria con el ID ${id} no existe.`, "RESOURCE_NOT_FOUND");
    return log;
}

const getAll = async (filters = {}) => {
    const { userId, method, entity, statusCode } = filters;
    const where = {};
    if(userId) where.userId = userId;
    if(method) where.method = method;
    if(entity) where.entity = entity;
    if(statusCode) where.statusCode = statusCode;

    const logs = await Worklog.findAll({
        where,
        order: [['createdAt', 'DESC']]
    });
    return logs;
}

module.exports = { create, getById, getAll };
