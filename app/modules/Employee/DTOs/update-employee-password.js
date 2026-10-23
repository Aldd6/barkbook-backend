const z = require('zod');

const UpdateEmployeePasswordDTO = z.object({
    password: z.string()
        .min(8, { message: "La contrasena debe tener al menos 8 caracteres." })
        .max(72, { message: "La contrasena no puede exceder los 72 caracteres." })
});

module.exports = UpdateEmployeePasswordDTO;
