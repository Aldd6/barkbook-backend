const z = require('zod');

const UserResponseDTO = z.object({
    uid: z.uuidv4(),
    rolId: z.number(),
    username: z.string().trim(),
    email: z.email().trim(),
    profileCompleted: z.boolean()
});

module.exports = UserResponseDTO;