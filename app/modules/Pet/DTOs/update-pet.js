const z = require('zod');
const { PET_SPECIES_ARRAY, SEX_ARRAY, PET_SIZE_ARRAY, UNIT_MEASURE_WEIGHT_PET_ARRAY } = require('../../../shared/constants/enums.js');

// customerId no es editable: la mascota no cambia de dueño por un update normal.
const UpdatePetDTO = z.object({
    name: z.string().trim()
        .min(1, { message: "El nombre de la mascota es obligatorio." })
        .max(100, { message: "El nombre no puede exceder los 100 caracteres." })
        .optional(),
    species: z.enum(PET_SPECIES_ARRAY).optional(),
    sex: z.enum(SEX_ARRAY).optional(),
    birthday: z.iso.date({ message: "La fecha de nacimiento debe tener el formato YYYY-MM-DD." })
        .refine(val => new Date(val) <= new Date(), { message: "La fecha de nacimiento no puede ser en el futuro." })
        .optional(),
    size: z.enum(PET_SIZE_ARRAY).optional(),
    actualWeight: z.number()
        .positive({ message: "El peso debe ser mayor a 0." })
        .optional(),
    unitOfMeasureWeight: z.enum(UNIT_MEASURE_WEIGHT_PET_ARRAY).optional(),
    sociabilityLevel: z.number().int({ message: "El nivel de sociabilidad debe ser un numero entero." })
        .min(0, { message: "El nivel de sociabilidad minimo es 0." })
        .max(5, { message: "El nivel de sociabilidad maximo es 5." })
        .optional(),
    isNeutered: z.boolean().optional(),
    vaccinationCard: z.string().trim()
        .max(500, { message: "La referencia de la imagen no puede exceder los 500 caracteres." })
        .optional(),
    profilePicture: z.string().trim()
        .max(500, { message: "La referencia de la imagen no puede exceder los 500 caracteres." })
        .optional()
});

module.exports = UpdatePetDTO;
