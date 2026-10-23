const z = require('zod');
const bookingCancellationService = require('./bookingCancellation.service.js');
const CreateBookingCancellationDTO = require('./DTOs/create-booking-cancellation.js');
const { ApproveBookingCancellationDTO, RejectBookingCancellationDTO } = require('./DTOs/resolve-booking-cancellation.js');
const BookingCancellationResponseDTO = require('./DTOs/booking-cancellation-response.js');
const { toResponseDTO: toBookingResponseDTO } = require('./booking.controller.js');
const { CANCELLATION_STATUS_ARRAY } = require('../../shared/constants/enums.js');

const ListQueryDTO = z.object({ status: z.enum(CANCELLATION_STATUS_ARRAY).optional() });

const toResponseDTO = (cancellation) => BookingCancellationResponseDTO.parse({
    id: cancellation.id,
    bookingId: cancellation.bookingId,
    branchId: cancellation.branchId ?? null,
    reason: cancellation.reason,
    status: cancellation.status,
    requestedByUserId: cancellation.requestedByUserId,
    resolvedByUserId: cancellation.resolvedByUserId,
    resolutionNotes: cancellation.resolutionNotes,
    requestedAt: cancellation.creadoEn,
    resolvedAt: cancellation.resolvedAt,
    booking: cancellation.Booking ? toBookingResponseDTO(cancellation.Booking) : undefined
});

const create = async (req, res, next) => {
    try {
        const requestDTO = CreateBookingCancellationDTO.parse(req.body);
        const cancellation = await bookingCancellationService.create(requestDTO, req.user);
        return res.status(201).json({
            success: true,
            status: 201,
            message: "Solicitud de cancelacion enviada. Recepcion de la sede la revisara.",
            bookingCancellation: toResponseDTO(cancellation)
        });
    } catch(error) {
        next(error);
    }
};

const getAll = async (req, res, next) => {
    try {
        const query = ListQueryDTO.parse(req.query);
        const cancellations = await bookingCancellationService.getAll(query, req.user);
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Solicitudes de cancelacion obtenidas exitosamente.",
            bookingCancellations: cancellations.map(toResponseDTO)
        });
    } catch(error) {
        next(error);
    }
};

const getByBooking = async (req, res, next) => {
    try {
        const { bookingId } = req.params;
        const cancellations = await bookingCancellationService.getByBooking(bookingId);
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Solicitudes de cancelacion de la reserva obtenidas exitosamente.",
            bookingCancellations: cancellations.map(toResponseDTO)
        });
    } catch(error) {
        next(error);
    }
};

const approve = async (req, res, next) => {
    try {
        const { id } = req.params;
        const requestDTO = ApproveBookingCancellationDTO.parse(req.body ?? {});
        const { cancellation, booking, refunds } = await bookingCancellationService.approve(id, requestDTO, req.user);
        return res.status(200).json({
            success: true,
            status: 200,
            message: refunds.length > 0
                ? "Cancelacion aprobada. La reserva fue cancelada y sus pagos reembolsados."
                : "Cancelacion aprobada. La reserva fue cancelada.",
            bookingCancellation: toResponseDTO(cancellation),
            booking: toBookingResponseDTO(booking)
        });
    } catch(error) {
        next(error);
    }
};

const reject = async (req, res, next) => {
    try {
        const { id } = req.params;
        const requestDTO = RejectBookingCancellationDTO.parse(req.body ?? {});
        const cancellation = await bookingCancellationService.reject(id, requestDTO, req.user);
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Solicitud de cancelacion rechazada.",
            bookingCancellation: toResponseDTO(cancellation)
        });
    } catch(error) {
        next(error);
    }
};

module.exports = { create, getAll, getByBooking, approve, reject };
