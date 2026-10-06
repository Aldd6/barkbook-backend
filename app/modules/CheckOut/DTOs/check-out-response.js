const z = require('zod');

const CheckOutResponseDTO = z.object({
    id: z.number(),
    checkInId: z.number(),
    bookingId: z.number().optional(),
    roomNumber: z.string().nullable().optional(),
    checkOutDate: z.iso.datetime(),
    observations: z.string().nullable().optional(),
    userId: z.number().nullable().optional()
});

module.exports = CheckOutResponseDTO;
