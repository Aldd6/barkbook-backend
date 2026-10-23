const z = require('zod');
const { todayISO } = require('../../../shared/utils/dates.js');

const UpdatePetSanityDTO = z.object({
    illnessName: z.string().trim()
        .min(2, { message: "El nombre de la enfermedad debe tener al menos 2 caracteres." })
        .max(150, { message: "El nombre de la enfermedad no puede exceder los 150 caracteres." })
        .optional(),
    isCronic: z.boolean().optional(),
    isContagious: z.boolean().optional(),
    sufferedSince: z.iso.date({ message: "La fecha de inicio debe tener el formato YYYY-MM-DD." })
        .refine(val => val <= todayISO(), { message: "La fecha de inicio no puede ser en el futuro." })
        .optional(),
    enduredUntil: z.iso.date({ message: "La fecha de finalizacion debe tener el formato YYYY-MM-DD." })
        .nullable()
        .optional()
});

module.exports = UpdatePetSanityDTO;
