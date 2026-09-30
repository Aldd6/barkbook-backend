const z = require('zod');
const { KINSHIP_ARRAY } = require('../../../shared/constants/enums.js');

const EmergencyContactResponseDTO = z.object({
    id: z.number(),
    customerId: z.number(),
    name: z.string(),
    lastname: z.string(),
    kinship: z.enum(KINSHIP_ARRAY),
    phoneNumber: z.string()
});

module.exports = EmergencyContactResponseDTO;
