const z = require('zod');

const notes = z.string().trim().max(255, { message: "Las notas no pueden exceder los 255 caracteres." });

// Aprobar: las notas son opcionales.
const ApproveBookingCancellationDTO = z.object({
    resolutionNotes: notes.optional()
});

// Rechazar: el cliente debe saber por que, asi que el motivo es obligatorio.
const RejectBookingCancellationDTO = z.object({
    resolutionNotes: notes.min(5, { message: "Indique el motivo del rechazo (minimo 5 caracteres)." })
});

module.exports = { ApproveBookingCancellationDTO, RejectBookingCancellationDTO };
