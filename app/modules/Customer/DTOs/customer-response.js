const z = require('zod');

const CustomerResponseDTO = z.object({
    id: z.number(),
    userId: z.number(),
    cityId: z.number(),
    name: z.string(),
    lastname: z.string(),
    dpiNumber: z.string(),
    nitOrCf: z.boolean(),
    nitNumber: z.string().nullable().optional(),
    addressLineOne: z.string(),
    addressLineTwo: z.string().nullable().optional(),
    phoneNumber: z.string(),
    profilePicture: z.string().nullable().optional(),
    termsAcceptance: z.boolean()
});

module.exports = CustomerResponseDTO;
