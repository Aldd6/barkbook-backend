const z = require('zod');

const CreateBookingCancellationDTO = z.object({
    bookingId: z.number(),
    reason: z.string().trim()
        .min(5, { message: "Indique el motivo de la cancelacion (minimo 5 caracteres)." })
        .max(255, { message: "El motivo no puede exceder los 255 caracteres." })
});

module.exports = CreateBookingCancellationDTO;
