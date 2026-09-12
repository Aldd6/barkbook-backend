const z = require('zod');
const { KINSHIP_ARRAY } = require('../../../shared/constants/enums.js');

const CreateEmergencyContactDTO = z.object({
    customerId: z.number(),
    name: z.string().trim()
        .min(2, { message: "El nombre debe tener al menos 2 caracteres." })
        .max(100, { message: "El nombre no puede exceder los 100 caracteres." }),
    lastname: z.string().trim()
        .min(2, { message: "El apellido debe tener al menos 2 caracteres." })
        .max(100, { message: "El apellido no puede exceder los 100 caracteres." }),
    kinship: z.enum(KINSHIP_ARRAY),
    phoneNumber: z.string().trim()
        .regex(/^\+502\d{8}$/, { message: "El numero de telefono debe tener el formato +502 seguido de 8 digitos." })
});

module.exports = CreateEmergencyContactDTO;
