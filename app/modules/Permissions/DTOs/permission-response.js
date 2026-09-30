const z = require('zod');
const { TYPE_TRANSACTION_ARRAY } = require('../../../shared/constants/enums.js');

const PermissionResponseDTO = z.object({
    id: z.number(),
    permissionName: z.string(),
    permissionType: z.enum([...TYPE_TRANSACTION_ARRAY])
});

module.exports = PermissionResponseDTO;