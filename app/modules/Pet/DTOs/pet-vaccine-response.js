const z = require('zod');
const { VACCINE_USE_ARRAY } = require('../../../shared/constants/enums.js');

const PetVaccineResponseDTO = z.object({
    id: z.number(),
    petId: z.number(),
    vaccineName: z.string(),
    vaccineUse: z.enum(VACCINE_USE_ARRAY),
    dateOfPlacement: z.iso.date()
});

module.exports = PetVaccineResponseDTO;
