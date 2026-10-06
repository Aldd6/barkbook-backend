const z = require('zod');
const { SERVICE_TYPE_ARRAY, PET_SPECIES_ARRAY } = require('../../../shared/constants/enums.js');

const ServiceResponseDTO = z.object({
    id: z.number(),
    name: z.string(),
    description: z.string().nullable().optional(),
    serviceType: z.enum(SERVICE_TYPE_ARRAY),
    speciesType: z.enum(PET_SPECIES_ARRAY).nullable().optional(),
    isMultiGuest: z.boolean(),
    rate: z.coerce.number()
});

module.exports = ServiceResponseDTO;
