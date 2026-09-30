const z = require('zod');

const BookingPetResponseDTO = z.object({
    id: z.number(),
    bookingId: z.number(),
    petId: z.number()
});

module.exports = BookingPetResponseDTO;
