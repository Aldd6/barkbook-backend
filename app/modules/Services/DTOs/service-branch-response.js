const z = require('zod');
const ServiceResponseDTO = require('./service-response.js');

const ServiceBranchResponseDTO = z.object({
    id: z.number(),
    branchId: z.number(),
    serviceId: z.number(),
    service: ServiceResponseDTO.nullable().optional()
});

module.exports = ServiceBranchResponseDTO;
