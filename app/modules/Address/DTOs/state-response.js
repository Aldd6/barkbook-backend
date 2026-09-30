const z = require('zod');

const StateResponseDTO = z.object({
    id: z.number(),
    stateName: z.string()
});

module.exports = StateResponseDTO;
