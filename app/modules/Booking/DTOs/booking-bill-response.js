const z = require('zod');
const { MOVEMENT_TYPE_ARRAY, PAYMENT_METHOD_ARRAY } = require('../../../shared/constants/enums.js');

const BookingBillResponseDTO = z.object({
    id: z.number(),
    bookingId: z.number(),
    movementType: z.enum(MOVEMENT_TYPE_ARRAY),
    amount: z.coerce.number(),
    methodPayment: z.enum(PAYMENT_METHOD_ARRAY),
    reference: z.string().nullable().optional(),
    description: z.string().nullable().optional()
});

module.exports = BookingBillResponseDTO;
