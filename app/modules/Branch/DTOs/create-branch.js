const z = require('zod');

const CreateBranchDTO = z.object({
    cityId: z.number(),
    branchName: z.string().trim()
        .min(3, { message: "El nombre de la sede debe tener al menos 3 caracteres." })
        .max(150, { message: "El nombre de la sede no puede exceder los 150 caracteres." }),
    addressLineOne: z.string().trim()
        .min(3, { message: "La direccion debe tener al menos 3 caracteres." })
        .max(254, { message: "La direccion no puede exceder los 254 caracteres." }),
    addressLineTwo: z.string().trim()
        .max(254, { message: "La direccion no puede exceder los 254 caracteres." })
        .optional()
});

module.exports = CreateBranchDTO;
