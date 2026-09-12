const z = require('zod');
const { VACCINE_USE_ARRAY } = require('../../../shared/constants/enums.js');

// petId no es editable: un registro de vacuna no se traspasa a otra mascota.
const UpdatePetVaccineDTO = z.object({
    vaccineName: z.string().trim()
        .min(2, { message: "El nombre de la vacuna debe tener al menos 2 caracteres." })
        .max(150, { message: "El nombre de la vacuna no puede exceder los 150 caracteres." })
        .optional(),
    vaccineUse: z.enum(VACCINE_USE_ARRAY).optional(),
    dateOfPlacement: z.iso.date({ message: "La fecha de colocacion debe tener el formato YYYY-MM-DD." })
        .refine(val => new Date(val) <= new Date(), { message: "La fecha de colocacion no puede ser en el futuro." })
        .optional()
});

module.exports = UpdatePetVaccineDTO;
