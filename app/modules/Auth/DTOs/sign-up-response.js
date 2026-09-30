const z = require('zod');

const SignUpResponseDTO = z.object({
    username: z.string().trim(),
    email: z.email().trim()
});

module.exports = SignUpResponseDTO;