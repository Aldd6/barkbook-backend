const z = require('zod');

const CreatePetSanityDTO = z.object({
    petId: z.number(),
    illnessName: z.string().trim()
        .min(2, { message: "El nombre de la enfermedad debe tener al menos 2 caracteres." })
        .max(150, { message: "El nombre de la enfermedad no puede exceder los 150 caracteres." }),
    isCronic: z.boolean(),
    isContagious: z.boolean(),
    sufferedSince: z.iso.date({ message: "La fecha de inicio debe tener el formato YYYY-MM-DD." })
        .refine(val => new Date(val) <= new Date(), { message: "La fecha de inicio no puede ser en el futuro." }),
    enduredUntil: z.iso.date({ message: "La fecha de finalizacion debe tener el formato YYYY-MM-DD." })
        .optional()
}).superRefine((data, ctx) => {
    if(data.enduredUntil && data.enduredUntil < data.sufferedSince) {
        ctx.addIssue({
            code: "custom",
            path: ['enduredUntil'],
            message: "La fecha en que finalizo la enfermedad no puede ser anterior a la fecha en que inicio."
        });
    }
});

module.exports = CreatePetSanityDTO;
