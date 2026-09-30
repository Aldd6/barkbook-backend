const z = require('zod');

const BranchResponseDTO = z.object({
    id: z.number(),
    cityId: z.number(),
    branchName: z.string(),
    addressLineOne: z.string(),
    addressLineTwo: z.string().nullable().optional()
});

module.exports = BranchResponseDTO;
