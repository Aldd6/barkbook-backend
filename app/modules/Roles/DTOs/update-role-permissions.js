const z = require('zod');

const UpdateRolePermissionsDTO = z.object({
    id: z.number().int().positive(),
    permissionsIds: z.number().int().positive().array()
});

module.exports = UpdateRolePermissionsDTO;