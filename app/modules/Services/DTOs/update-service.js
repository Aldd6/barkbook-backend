const z = require('zod');
const { SERVICE_TYPE_ARRAY, PET_SPECIES_ARRAY } = require('../../../shared/constants/enums.js');

// Cambiar la tarifa no afecta los cargos ya registrados: cada BookingBill
// guarda el monto calculado al momento de cargar el servicio.
const UpdateServiceDTO = z.object({
    name: z.string().trim()
        .min(2, { message: "El nombre debe tener al menos 2 caracteres." })
        .max(100, { message: "El nombre no puede exceder los 100 caracteres." })
        .optional(),
    description: z.string().trim()
        .max(500, { message: "La descripcion no puede exceder los 500 caracteres." })
        .optional(),
    serviceType: z.enum(SERVICE_TYPE_ARRAY).optional(),
    speciesType: z.enum(PET_SPECIES_ARRAY).nullable().optional(),
    isMultiGuest: z.boolean().optional(),
    rate: z.number().positive({ message: "La tarifa del servicio debe ser mayor a 0." }).optional()
});

module.exports = UpdateServiceDTO;
