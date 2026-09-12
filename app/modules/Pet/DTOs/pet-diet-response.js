const z = require('zod');
const { DIET_TYPE_ARRAY, UNIT_MEASURE_SERVING_PET_ARRAY } = require('../../../shared/constants/enums.js');

const PetDietResponseDTO = z.object({
    id: z.number(),
    petId: z.number(),
    dietType: z.enum(DIET_TYPE_ARRAY),
    timesToEatAday: z.number(),
    servings: z.coerce.number(),
    unitOfMeasureServing: z.enum(UNIT_MEASURE_SERVING_PET_ARRAY),
    observations: z.string().nullable().optional(),
    activeDiet: z.boolean()
});

module.exports = PetDietResponseDTO;
