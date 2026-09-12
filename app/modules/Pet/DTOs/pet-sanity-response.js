const z = require('zod');

const PetSanityResponseDTO = z.object({
    id: z.number(),
    petId: z.number(),
    illnessName: z.string(),
    isCronic: z.boolean(),
    isContagious: z.boolean(),
    sufferedSince: z.iso.date(),
    enduredUntil: z.iso.date().nullable().optional(),
    isIllnessActive: z.boolean()
});

module.exports = PetSanityResponseDTO;
