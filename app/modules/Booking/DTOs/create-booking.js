const z = require('zod');
const { PAYMENT_METHOD_ARRAY } = require('../../../shared/constants/enums.js');

const CreateBookingDTO = z.object({
    branchRoomId: z.number(),
    customerId: z.number(),
    checkInDate: z.iso.date({ message: "La fecha de check-in debe tener el formato YYYY-MM-DD." }),
    checkOutDate: z.iso.date({ message: "La fecha de check-out debe tener el formato YYYY-MM-DD." }),
    petIds: z.array(z.number()).min(1, { message: "Debe incluir al menos una mascota en la reserva." }),
    paymentMethod: z.enum(PAYMENT_METHOD_ARRAY),
    stripePaymentMethodId: z.string().trim().optional()
}).superRefine((data, ctx) => {
    if(data.checkOutDate <= data.checkInDate) {
        ctx.addIssue({
            code: "custom",
            path: ['checkOutDate'],
            message: "La fecha de check-out debe ser posterior a la fecha de check-in."
        });
    }
    const today = new Date().toISOString().slice(0, 10);
    if(data.checkInDate < today) {
        ctx.addIssue({
            code: "custom",
            path: ['checkInDate'],
            message: "La fecha de check-in no puede ser en el pasado."
        });
    }
});

module.exports = CreateBookingDTO;
