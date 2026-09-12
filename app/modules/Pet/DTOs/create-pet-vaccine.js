const z = require('zod');
const { VACCINE_USE_ARRAY } = require('../../../shared/constants/enums.js');

const CreatePetVaccineDTO = z.object({
    petId: z.number(),
    vaccineName: z.string().trim()
        .min(2, { message: "El nombre de la vacuna debe tener al menos 2 caracteres." })
        .max(150, { message: "El nombre de la vacuna no puede exceder los 150 caracteres." }),
    vaccineUse: z.enum(VACCINE_USE_ARRAY),
    dateOfPlacement: z.iso.date({ message: "La fecha de colocacion debe tener el formato YYYY-MM-DD." })
        .refine(val => new Date(val) <= new Date(), { message: "La fecha de colocacion no puede ser en el futuro." })
});

module.exports = CreatePetVaccineDTO;
