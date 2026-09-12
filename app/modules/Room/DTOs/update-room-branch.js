const z = require('zod');

const UpdateRoomBranchDTO = z.object({
    maximumQuantity: z.number().int({ message: "La cantidad maxima debe ser un numero entero." })
        .min(1, { message: "La cantidad maxima debe ser al menos 1." })
});

module.exports = UpdateRoomBranchDTO;
