const z = require('zod');
const { DIET_TYPE_ARRAY, UNIT_MEASURE_SERVING_PET_ARRAY } = require('../../../shared/constants/enums.js');


const UpdatePetDietDTO = z.object({
    dietType: z.enum(DIET_TYPE_ARRAY).optional(),
    timesToEatAday: z.number().int({ message: "Las veces al dia debe ser un numero entero." })
        .min(1, { message: "Las veces al dia que come la mascota deben ser al menos 1." })
        .optional(),
    servings: z.number()
        .positive({ message: "La porcion debe ser mayor a 0." })
        .optional(),
    unitOfMeasureServing: z.enum(UNIT_MEASURE_SERVING_PET_ARRAY).optional(),
    observations: z.string().trim()
        .max(500, { message: "Las observaciones no pueden exceder los 500 caracteres." })
        .optional()
});

module.exports = UpdatePetDietDTO;
