const z = require('zod');
const { TYPE_TRANSACTION_ARRAY } = require('../../../shared/constants/enums.js');

const permissionSchema = z.object({
    id: z.number(),
    permissionName: z.string(),
    permissionType: z.enum([...TYPE_TRANSACTION_ARRAY])
});

const RoleResponseDTO = z.object({
    id: z.number().int().positive(),
    name: z.string().trim(),
    permissions: z.array(permissionSchema).optional()
});

module.exports = RoleResponseDTO;