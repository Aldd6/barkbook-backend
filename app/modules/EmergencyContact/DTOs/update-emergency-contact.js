const z = require('zod');
const { KINSHIP_ARRAY } = require('../../../shared/constants/enums.js');

// customerId no es editable: un contacto de emergencia no deberia
// "traspasarse" a otro cliente, se elimina y se crea uno nuevo si aplica.
const UpdateEmergencyContactDTO = z.object({
    name: z.string().trim()
        .min(2, { message: "El nombre debe tener al menos 2 caracteres." })
        .max(100, { message: "El nombre no puede exceder los 100 caracteres." })
        .optional(),
    lastname: z.string().trim()
        .min(2, { message: "El apellido debe tener al menos 2 caracteres." })
        .max(100, { message: "El apellido no puede exceder los 100 caracteres." })
        .optional(),
    kinship: z.enum(KINSHIP_ARRAY).optional(),
    phoneNumber: z.string().trim()
        .regex(/^\+502\d{8}$/, { message: "El numero de telefono debe tener el formato +502 seguido de 8 digitos." })
        .optional()
});

module.exports = UpdateEmergencyContactDTO;
