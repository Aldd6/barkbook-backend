const z = require('zod');

// petId no es editable. La consistencia enduredUntil >= sufferedSince para un
// update parcial se resuelve en el servicio (igual que nitOrCf/nitNumber en
// Customer), porque depende del estado ya guardado del registro.
const UpdatePetSanityDTO = z.object({
    illnessName: z.string().trim()
        .min(2, { message: "El nombre de la enfermedad debe tener al menos 2 caracteres." })
        .max(150, { message: "El nombre de la enfermedad no puede exceder los 150 caracteres." })
        .optional(),
    isCronic: z.boolean().optional(),
    isContagious: z.boolean().optional(),
    sufferedSince: z.iso.date({ message: "La fecha de inicio debe tener el formato YYYY-MM-DD." })
        .refine(val => new Date(val) <= new Date(), { message: "La fecha de inicio no puede ser en el futuro." })
        .optional(),
    // Pasar null explicito reactiva la enfermedad (borra la fecha de fin).
    enduredUntil: z.iso.date({ message: "La fecha de finalizacion debe tener el formato YYYY-MM-DD." })
        .nullable()
        .optional()
});

module.exports = UpdatePetSanityDTO;
