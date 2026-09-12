const z = require('zod');

const CityResponseDTO = z.object({
    id: z.number(),
    stateId: z.number(),
    cityName: z.string()
});

module.exports = CityResponseDTO;
