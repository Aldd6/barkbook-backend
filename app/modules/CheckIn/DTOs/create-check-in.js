const z = require('zod');

const CheckInPetDTO = z.object({
    bookingPetId: z.number(),
    admitted: z.boolean(),
    nonadmissionReason: z.string().trim()
        .max(255, { message: "El motivo de no admision no puede exceder los 255 caracteres." })
        .optional()
});

const CreateCheckInDTO = z.object({
    bookingId: z.number(),
    pets: z.array(CheckInPetDTO).min(1, { message: "Debe incluir el detalle de las mascotas de la reserva." }),
    customerAcceptsPartialAdmission: z.boolean().optional(),
    roomNumber: z.string().trim()
        .max(20, { message: "El numero de habitacion no puede exceder los 20 caracteres." })
        .optional(),
    observations: z.string().trim()
        .max(255, { message: "Las observaciones no pueden exceder los 255 caracteres." })
        .optional()
}).superRefine((data, ctx) => {
    data.pets.forEach((pet, index) => {
        if(!pet.admitted && !pet.nonadmissionReason) {
            ctx.addIssue({
                code: "custom",
                path: ['pets', index, 'nonadmissionReason'],
                message: "Debe indicar el motivo por el cual la mascota no es admitida."
            });
        }
    });

    const bookingPetIds = data.pets.map(pet => pet.bookingPetId);
    if(new Set(bookingPetIds).size !== bookingPetIds.length) {
        ctx.addIssue({
            code: "custom",
            path: ['pets'],
            message: "No se puede repetir una mascota en el detalle del check-in."
        });
    }

    const admittedCount = data.pets.filter(pet => pet.admitted).length;
    const isPartial = admittedCount > 0 && admittedCount < data.pets.length;
    if(isPartial && data.customerAcceptsPartialAdmission === undefined) {
        ctx.addIssue({
            code: "custom",
            path: ['customerAcceptsPartialAdmission'],
            message: "Algunas mascotas no fueron admitidas: debe indicar si el cliente acepta dejar solo las mascotas admitidas."
        });
    }
});

module.exports = CreateCheckInDTO;
