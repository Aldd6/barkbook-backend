const z = require('zod');

// Unica via de entrada para crear RoomInventory: bulk, nunca una habitacion
const GenerateRoomInventoryDTO = z.object({
    branchId: z.number(),
    roomTypeId: z.number(),
    quantity: z.number().int({ message: "La cantidad debe ser un numero entero." })
        .min(1, { message: "La cantidad debe ser al menos 1." })
        .max(500, { message: "No se pueden generar mas de 500 habitaciones en una sola operacion." })
});

module.exports = GenerateRoomInventoryDTO;
