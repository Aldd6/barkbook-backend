const z = require('zod');

// petIds solo aplica a servicios por mascota (isMultiGuest = false). Si se
// omite, el servicio se carga a todas las mascotas admitidas en el check-in.
const ChargeServiceDTO = z.object({
    serviceId: z.number(),
    petIds: z.array(z.number())
        .min(1, { message: "Debe indicar al menos una mascota." })
        .optional(),
    description: z.string().trim()
        .max(255, { message: "La descripcion no puede exceder los 255 caracteres." })
        .optional()
});

module.exports = ChargeServiceDTO;
