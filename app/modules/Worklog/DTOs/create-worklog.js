const z = require('zod');
const { METHOD_TRANSACTION_ARRAY } = require('../../../shared/constants/enums.js');

const CreateWorklogDTO = z.object({
    userId: z.number().int().positive().optional(),
    method: z.enum(METHOD_TRANSACTION_ARRAY),
    endpoint: z.string()
        .max(254, { message: "El endpoint no puede exceder de los 254 caracteres." }),
    entity: z.string()
        .max(150, { message: "El nombre de la entidad afectada no puede exceder los 150 caracteres."  }),
    statusCode: z.number(),
    detail: z.string()
        .max(150, { message: "El detalle del log no puede exceder los 150 caracteres." })
        .optional(),
    ipAddress: z.string()
        .max(45, { message: "La direccion IP no puede exceder de los 45 caracteres." })
});

module.exports = CreateWorklogDTO;