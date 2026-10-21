const z = require('zod');

// Filtro opcional del listado de habitaciones archivadas (query string)
const ArchivedRoomInventoryQueryDTO = z.object({
    roomBranchId: z.coerce.number({ message: "El roomBranchId debe ser un numero." })
        .int({ message: "El roomBranchId debe ser un numero entero." })
        .positive({ message: "El roomBranchId debe ser mayor a 0." })
        .optional()
});

module.exports = ArchivedRoomInventoryQueryDTO;
