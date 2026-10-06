const z = require('zod');

const CreateCheckOutDTO = z.object({
    checkInId: z.number(),
    observations: z.string().trim()
        .max(255, { message: "Las observaciones no pueden exceder los 255 caracteres." })
        .optional()
});

module.exports = CreateCheckOutDTO;
