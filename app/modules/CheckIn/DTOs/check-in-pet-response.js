const z = require('zod');

const CheckInPetResponseDTO = z.object({
    id: z.number(),
    checkInId: z.number(),
    bookingPetId: z.number(),
    petId: z.number().optional(),
    admitted: z.boolean(),
    nonadmissionReason: z.string().nullable().optional()
});

module.exports = CheckInPetResponseDTO;
