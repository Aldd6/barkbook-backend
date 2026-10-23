const z = require('zod');

const CreateServiceOrderDTO = z.object({
    serviceId: z.number(),
    petIds: z.array(z.number())
        .min(1, { message: "Debe indicar al menos una mascota." })
        .optional(),
    description: z.string().trim()
        .max(255, { message: "La descripcion no puede exceder los 255 caracteres." })
        .optional()
});

module.exports = CreateServiceOrderDTO;
