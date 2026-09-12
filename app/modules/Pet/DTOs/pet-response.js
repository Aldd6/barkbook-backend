const z = require('zod');
const { PET_SPECIES_ARRAY, SEX_ARRAY, PET_SIZE_ARRAY, UNIT_MEASURE_WEIGHT_PET_ARRAY } = require('../../../shared/constants/enums.js');

const PetResponseDTO = z.object({
    id: z.number(),
    customerId: z.number(),
    name: z.string(),
    species: z.enum(PET_SPECIES_ARRAY),
    sex: z.enum(SEX_ARRAY),
    birthday: z.iso.date(),
    size: z.enum(PET_SIZE_ARRAY),
    actualWeight: z.coerce.number(),
    unitOfMeasureWeight: z.enum(UNIT_MEASURE_WEIGHT_PET_ARRAY),
    sociabilityLevel: z.number(),
    isNeutered: z.boolean(),
    vaccinationCard: z.string().nullable().optional(),
    profilePicture: z.string().nullable().optional()
});

module.exports = PetResponseDTO;
