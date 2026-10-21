const z = require('zod');
const ConfirmBookingPaymentDTO = require('../../Booking/DTOs/confirm-booking-payment.js');

const CreateCheckOutDTO = z.object({
    checkInId: z.number(),
    observations: z.string().trim()
        .max(255, { message: "Las observaciones no pueden exceder los 255 caracteres." })
        .optional(),
    // Pago en mostrador del saldo pendiente (ej. servicios cargados a la cuenta
    // durante la estancia). Se aplica en la misma transaccion del check-out.
    payment: ConfirmBookingPaymentDTO.optional()
});

module.exports = CreateCheckOutDTO;
