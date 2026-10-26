const z = require('zod');
const UserResponseDTO = require('./user-response.js');
const CustomerResponseDTO = require('../../Customer/DTOs/customer-response.js');
const PetResponseDTO = require('../../Pet/DTOs/pet-response.js');

const CustomerUserResponseDTO = UserResponseDTO.extend({
    customer: CustomerResponseDTO.nullable()
});

const CustomerUserDetailResponseDTO = UserResponseDTO.extend({
    customer: CustomerResponseDTO.nullable(),
    pets: z.array(PetResponseDTO)
});

module.exports = { CustomerUserResponseDTO, CustomerUserDetailResponseDTO };
