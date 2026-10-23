const z = require('zod');

const notes = z.string().trim().max(255, { message: "Las notas no pueden exceder los 255 caracteres." });

const CompleteServiceOrderDTO = z.object({
    resolutionNotes: notes.optional()
});

const CancelServiceOrderDTO = z.object({
    resolutionNotes: notes.min(5, { message: "Indique el motivo de la cancelacion (minimo 5 caracteres)." })
});

module.exports = { CompleteServiceOrderDTO, CancelServiceOrderDTO };
