const z = require('zod');

const CreateServiceBranchDTO = z.object({
    branchId: z.number(),
    serviceId: z.number()
});

module.exports = CreateServiceBranchDTO;
