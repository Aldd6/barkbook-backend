const z = require('zod');

const CreateRoomBranchDTO = z.object({
    branchId: z.number(),
    roomTypeId: z.number(),
    maximumQuantity: z.number().int({ message: "La cantidad maxima debe ser un numero entero." })
        .min(1, { message: "La cantidad maxima debe ser al menos 1." })
});

module.exports = CreateRoomBranchDTO;
