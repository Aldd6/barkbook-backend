const z = require('zod');
const { PAYMENT_METHOD, PAYMENT_METHOD_ARRAY } = require('../../../shared/constants/enums.js');

const DEFERRED_PAYMENT_METHODS = PAYMENT_METHOD_ARRAY.filter(method => method !== PAYMENT_METHOD.TARJETA);

const ConfirmBookingPaymentDTO = z.object({
    methodPayment: z.enum(DEFERRED_PAYMENT_METHODS),
    reference: z.string().trim()
        .max(150, { message: "La referencia no puede exceder los 150 caracteres." })
        .optional(),
    description: z.string().trim()
        .max(255, { message: "La descripcion no puede exceder los 255 caracteres." })
        .optional()
});

module.exports = ConfirmBookingPaymentDTO;
