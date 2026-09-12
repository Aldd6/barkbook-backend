const z = require('zod');

const UpdateEmployeeDTO = z.object({
    branchId: z.number().optional(),
    cityId: z.number().optional(),
    name: z.string().trim()
        .min(2, { message: "El nombre debe tener al menos 2 caracteres." })
        .max(100, { message: "El nombre no puede exceder los 100 caracteres." })
        .optional(),
    lastname: z.string().trim()
        .min(2, { message: "El apellido debe tener al menos 2 caracteres." })
        .max(100, { message: "El apellido no puede exceder los 100 caracteres." })
        .optional(),
    addressLineOne: z.string().trim()
        .min(3, { message: "La direccion debe tener al menos 3 caracteres." })
        .max(254, { message: "La direccion no puede exceder los 254 caracteres." })
        .optional(),
    addressLineTwo: z.string().trim()
        .max(254, { message: "La direccion no puede exceder los 254 caracteres." })
        .optional(),
    phoneNumber: z.string().trim()
        .regex(/^\+502\d{8}$/, { message: "El numero de telefono debe tener el formato +502 seguido de 8 digitos." })
        .optional(),
    profilePicture: z.string().trim()
        .max(500, { message: "La referencia de la imagen no puede exceder los 500 caracteres." })
        .optional()
});

module.exports = UpdateEmployeeDTO;
