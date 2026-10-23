const z = require('zod');
const PetResponseDTO = require('../../Pet/DTOs/pet-response.js');
const PetVaccineResponseDTO = require('../../Pet/DTOs/pet-vaccine-response.js');

const CheckInBookingPetResponseDTO = z.object({
    bookingPetId: z.number(),
    pet: PetResponseDTO,
    vaccines: z.array(PetVaccineResponseDTO)
});

module.exports = CheckInBookingPetResponseDTO;
