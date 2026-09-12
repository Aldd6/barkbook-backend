const z = require('zod');
const { PET_SPECIES_ARRAY } = require('../../../shared/constants/enums.js');

const RoomTypeResponseDTO = z.object({
    id: z.number(),
    name: z.string(),
    prefix: z.string(),
    speciesType: z.enum(PET_SPECIES_ARRAY),
    isCage: z.boolean(),
    lengthDimension: z.coerce.number(),
    widthDimensions: z.coerce.number(),
    heightDimensions: z.coerce.number(),
    description: z.string().nullable().optional(),
    hasAC: z.boolean(),
    isSoundproofed: z.boolean(),
    hasCCTV: z.boolean(),
    hasOrthopedicBed: z.boolean(),
    hasPrivateYard: z.boolean(),
    hasSharedYard: z.boolean(),
    hasToys: z.boolean(),
    maximumNumberOfGuests: z.number(),
    nightlyRate: z.coerce.number()
});

module.exports = RoomTypeResponseDTO;
