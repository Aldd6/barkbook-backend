const z = require('zod');

const UpdateUserDTO = z.object({
    rolId: z.number().optional(),
    username: z.string().trim()
        .min(3, { message: "El nombre de usuario debe tener al menos 3 caracteres." })
        .max(50, { message: "El nombre de usuario no puede exceder los 50 caracteres." })
        .regex(/^[A-Za-z0-9]+$/, { message: "El nombre de usuario debe contener unicamente numeros y letras." })
        .optional(),
    email: z.email().trim()
        .min(5, { message: "El correo electronico debe tener al menos 5 caracteres." })
        .max(254, { message: "El correo electronico no puede exceder los 254 caracteres." })
        .optional(),
    password: z.string().trim().optional(),
    profileCompleted: z.boolean().optional()
});

module.exports = UpdateUserDTO;