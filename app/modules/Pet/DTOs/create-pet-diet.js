const z = require('zod');
const { DIET_TYPE_ARRAY, UNIT_MEASURE_SERVING_PET_ARRAY } = require('../../../shared/constants/enums.js');

const CreatePetDietDTO = z.object({
    petId: z.number(),
    dietType: z.enum(DIET_TYPE_ARRAY),
    timesToEatAday: z.number().int({ message: "Las veces al dia debe ser un numero entero." })
        .min(1, { message: "Las veces al dia que come la mascota deben ser al menos 1." }),
    servings: z.number()
        .positive({ message: "La porcion debe ser mayor a 0." }),
    unitOfMeasureServing: z.enum(UNIT_MEASURE_SERVING_PET_ARRAY),
    observations: z.string().trim()
        .max(500, { message: "Las observaciones no pueden exceder los 500 caracteres." })
        .optional(),
    activeDiet: z.boolean().optional()
});

module.exports = CreatePetDietDTO;
