const z = require('zod');
const { SERVICE_PAYMENT_OPTION_ARRAY } = require('../../../shared/constants/enums.js');

// petIds solo aplica a servicios por mascota (isMultiGuest = false). Si se
// omite, el servicio se carga a todas las mascotas admitidas en el check-in.
// paymentMethod: TARJETA cobra al momento con Stripe; CARGO A CUENTA deja el
// cargo pendiente para que el Recepcionista lo cobre en mostrador.
const ChargeServiceDTO = z.object({
    serviceId: z.number(),
    petIds: z.array(z.number())
        .min(1, { message: "Debe indicar al menos una mascota." })
        .optional(),
    paymentMethod: z.enum(SERVICE_PAYMENT_OPTION_ARRAY),
    stripePaymentMethodId: z.string().trim().optional(),
    description: z.string().trim()
        .max(255, { message: "La descripcion no puede exceder los 255 caracteres." })
        .optional()
});

module.exports = ChargeServiceDTO;
