const z = require('zod');
const { PET_SPECIES_ARRAY } = require('../../../shared/constants/enums.js');

// prefix no es editable: ya quedo embebido en el roomNumber de cada
// RoomInventory generada con este tipo, cambiarlo despues las desincroniza.
const UpdateRoomTypeDTO = z.object({
    name: z.string().trim()
        .min(2, { message: "El nombre debe tener al menos 2 caracteres." })
        .max(100, { message: "El nombre no puede exceder los 100 caracteres." })
        .optional(),
    speciesType: z.enum(PET_SPECIES_ARRAY).optional(),
    isCage: z.boolean().optional(),
    lengthDimension: z.number().positive({ message: "El largo debe ser mayor a 0." }).optional(),
    widthDimensions: z.number().positive({ message: "El ancho debe ser mayor a 0." }).optional(),
    heightDimensions: z.number().positive({ message: "El alto debe ser mayor a 0." }).optional(),
    description: z.string().trim()
        .max(500, { message: "La descripcion no puede exceder los 500 caracteres." })
        .optional(),
    hasAC: z.boolean().optional(),
    isSoundproofed: z.boolean().optional(),
    hasCCTV: z.boolean().optional(),
    hasOrthopedicBed: z.boolean().optional(),
    hasPrivateYard: z.boolean().optional(),
    hasSharedYard: z.boolean().optional(),
    hasToys: z.boolean().optional(),
    maximumNumberOfGuests: z.number().int({ message: "El maximo de huespedes debe ser un numero entero." })
        .min(1, { message: "El maximo de huespedes debe ser al menos 1." })
        .optional(),
    nightlyRate: z.number().positive({ message: "La tarifa por noche debe ser mayor a 0." }).optional()
});

module.exports = UpdateRoomTypeDTO;
