const z = require('zod');
const { CANCELLATION_STATUS_ARRAY } = require('../../../shared/constants/enums.js');
const BookingResponseDTO = require('./booking-response.js');

const BookingCancellationResponseDTO = z.object({
    id: z.number(),
    bookingId: z.number(),
    branchId: z.number().nullable().optional(),
    reason: z.string(),
    status: z.enum(CANCELLATION_STATUS_ARRAY),
    requestedByUserId: z.number(),
    resolvedByUserId: z.number().nullable(),
    resolutionNotes: z.string().nullable(),
    requestedAt: z.date(),
    resolvedAt: z.date().nullable(),
    booking: BookingResponseDTO.optional()
});

module.exports = BookingCancellationResponseDTO;
