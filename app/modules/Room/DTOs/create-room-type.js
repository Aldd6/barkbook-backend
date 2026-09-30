const z = require('zod');
const { PET_SPECIES_ARRAY } = require('../../../shared/constants/enums.js');

const CreateRoomTypeDTO = z.object({
    name: z.string().trim()
        .min(2, { message: "El nombre debe tener al menos 2 caracteres." })
        .max(100, { message: "El nombre no puede exceder los 100 caracteres." }),
    prefix: z.string().trim()
        .regex(/^[A-Za-z0-9]{2,10}$/, { message: "El prefijo debe tener entre 2 y 10 caracteres, solo letras y numeros." })
        .transform(val => val.toUpperCase()),
    speciesType: z.enum(PET_SPECIES_ARRAY),
    isCage: z.boolean(),
    lengthDimension: z.number().positive({ message: "El largo debe ser mayor a 0." }),
    widthDimensions: z.number().positive({ message: "El ancho debe ser mayor a 0." }),
    heightDimensions: z.number().positive({ message: "El alto debe ser mayor a 0." }),
    description: z.string().trim()
        .max(500, { message: "La descripcion no puede exceder los 500 caracteres." })
        .optional(),
    hasAC: z.boolean(),
    isSoundproofed: z.boolean(),
    hasCCTV: z.boolean(),
    hasOrthopedicBed: z.boolean(),
    hasPrivateYard: z.boolean(),
    hasSharedYard: z.boolean(),
    hasToys: z.boolean(),
    maximumNumberOfGuests: z.number().int({ message: "El maximo de huespedes debe ser un numero entero." })
        .min(1, { message: "El maximo de huespedes debe ser al menos 1." }),
    nightlyRate: z.number().positive({ message: "La tarifa por noche debe ser mayor a 0." })
});

module.exports = CreateRoomTypeDTO;
