const z = require('zod');

const CreateRoleDTO = z.object({
    name: z.string().trim()
        .min(3, { message: "El nombre del rol debe tener al menos 3 caracteres." })
        .max(150, { message: "El nombre del rol no puede exceder los 150 caracteres." })
});

module.exports = CreateRoleDTO;