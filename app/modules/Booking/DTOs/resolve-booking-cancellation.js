const z = require('zod');

const notes = z.string().trim().max(255, { message: "Las notas no pueden exceder los 255 caracteres." });

const ApproveBookingCancellationDTO = z.object({
    resolutionNotes: notes.optional()
});

const RejectBookingCancellationDTO = z.object({
    resolutionNotes: notes.min(5, { message: "Indique el motivo del rechazo (minimo 5 caracteres)." })
});

module.exports = { ApproveBookingCancellationDTO, RejectBookingCancellationDTO };
