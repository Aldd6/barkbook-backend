const z = require('zod');
const { ROOM_STATUS_ARRAY } = require('../../../shared/constants/enums.js');

const UpdateRoomInventoryDTO = z.object({
    status: z.enum(ROOM_STATUS_ARRAY).optional(),
    active: z.boolean().optional()
});

module.exports = UpdateRoomInventoryDTO;
