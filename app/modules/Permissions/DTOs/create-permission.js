const z = require('zod');
const { TYPE_TRANSACTION_ARRAY } = require('../../../shared/constants/enums.js');

const CreatePermissionDTO = z.object({
    permissionName: z.string()
        .min(1, { message: 'Permission name is required.' })
        .max(150, { message: 'Permission name must be at most 150 characters long.' }),
    permissionType: z.enum([...TYPE_TRANSACTION_ARRAY], {
         message: 'Permission type must be one of the following: ' + TYPE_TRANSACTION_ARRAY.join(', ') 
    })
});

module.exports = CreatePermissionDTO;