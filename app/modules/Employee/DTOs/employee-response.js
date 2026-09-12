const z = require('zod');

const EmployeeResponseDTO = z.object({
    id: z.number(),
    userId: z.number().nullable().optional(),
    branchId: z.number(),
    cityId: z.number(),
    name: z.string(),
    lastname: z.string(),
    dpiNumber: z.string(),
    addressLineOne: z.string(),
    addressLineTwo: z.string().nullable().optional(),
    phoneNumber: z.string(),
    profilePicture: z.string().nullable().optional()
});

module.exports = EmployeeResponseDTO;
