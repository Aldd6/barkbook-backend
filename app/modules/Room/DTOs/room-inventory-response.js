const z = require('zod');
const { ROOM_STATUS_ARRAY } = require('../../../shared/constants/enums.js');

const RoomInventoryResponseDTO = z.object({
    id: z.number(),
    roomBranchId: z.number(),
    roomNumber: z.string(),
    status: z.enum(ROOM_STATUS_ARRAY),
    active: z.boolean(),
    // null si la habitacion esta vigente; fecha de archivado si esta archivada
    archivedAt: z.date().nullable()
});

module.exports = RoomInventoryResponseDTO;
