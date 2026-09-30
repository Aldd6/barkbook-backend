const z = require('zod');
const { BOOKING_STATUS_ARRAY } = require('../../../shared/constants/enums.js');
const BookingPetResponseDTO = require('./booking-pet-response.js');
const BookingBillResponseDTO = require('./booking-bill-response.js');

const BookingResponseDTO = z.object({
    id: z.number(),
    branchRoomId: z.number(),
    customerId: z.number(),
    checkInDate: z.iso.date(),
    checkOutDate: z.iso.date(),
    bookingStatus: z.enum(BOOKING_STATUS_ARRAY),
    nightlyRate: z.coerce.number(),
    cancellationReason: z.string().nullable().optional(),
    pets: z.array(BookingPetResponseDTO).optional(),
    bill: z.array(BookingBillResponseDTO).optional()
});

module.exports = BookingResponseDTO;
