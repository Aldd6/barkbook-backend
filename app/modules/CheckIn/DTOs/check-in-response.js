const z = require('zod');
const { CHECK_IN_STATUS_ARRAY } = require('../../../shared/constants/enums.js');
const CheckInPetResponseDTO = require('./check-in-pet-response.js');

const CheckInResponseDTO = z.object({
    id: z.number(),
    bookingId: z.number(),
    roomInventoryId: z.number().nullable().optional(),
    roomNumber: z.string().nullable().optional(),
    checkInDate: z.iso.date(),
    observations: z.string().nullable().optional(),
    status: z.enum(CHECK_IN_STATUS_ARRAY),
    pets: z.array(CheckInPetResponseDTO).optional()
});

module.exports = CheckInResponseDTO;
