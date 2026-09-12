const z = require('zod');

const RoomBranchResponseDTO = z.object({
    id: z.number(),
    branchId: z.number(),
    roomTypeId: z.number(),
    maximumQuantity: z.number()
});

module.exports = RoomBranchResponseDTO;
