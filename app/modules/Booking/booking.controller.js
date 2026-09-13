const bookingService = require('./booking.service.js');
const CreateBookingDTO = require('./DTOs/create-booking.js');
const ConfirmBookingPaymentDTO = require('./DTOs/confirm-booking-payment.js');
const BookingResponseDTO = require('./DTOs/booking-response.js');
const BookingPetResponseDTO = require('./DTOs/booking-pet-response.js');
const BookingBillResponseDTO = require('./DTOs/booking-bill-response.js');

const toResponseDTO = (booking) => BookingResponseDTO.parse({
    id: booking.id,
    branchRoomId: booking.branchRoomId,
    customerId: booking.customerId,
    checkInDate: booking.checkInDate,
    checkOutDate: booking.checkOutDate,
    bookingStatus: booking.bookingStatus,
    nightlyRate: booking.nightlyRate,
    cancellationReason: booking.cancellationReason,
    pets: (booking.BookingPets || []).map(bp => BookingPetResponseDTO.parse({
        id: bp.id,
        bookingId: bp.bookingId,
        petId: bp.petId
    })),
    bill: (booking.BookingBills || []).map(bb => BookingBillResponseDTO.parse({
        id: bb.id,
        bookingId: bb.bookingId,
        movementType: bb.movementType,
        amount: bb.amount,
        methodPayment: bb.methodPayment,
        reference: bb.reference,
        description: bb.description
    }))
});

const create = async (req, res, next) => {
    try {
        const requestDTO = CreateBookingDTO.parse(req.body);
        const newBooking = await bookingService.create(requestDTO);
        return res.status(201).json({
            success: true,
            status: 201,
            message: "Reserva creada exitosamente.",
            booking: toResponseDTO(newBooking)
        });
    } catch(error) {
        next(error);
    }
};

const confirmPayment = async (req, res, next) => {
    try {
        const { id } = req.params;
        const requestDTO = ConfirmBookingPaymentDTO.parse(req.body);
        const updatedBooking = await bookingService.confirmPayment(id, requestDTO);
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Pago confirmado y reserva actualizada exitosamente.",
            booking: toResponseDTO(updatedBooking)
        });
    } catch(error) {
        next(error);
    }
};

const getById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const booking = await bookingService.getById(id);
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Reserva encontrada exitosamente.",
            booking: toResponseDTO(booking)
        });
    } catch(error) {
        next(error);
    }
};

const getAll = async (req, res, next) => {
    try {
        const bookings = await bookingService.getAll();
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Reservas obtenidas exitosamente.",
            bookings: bookings.map(toResponseDTO)
        });
    } catch(error) {
        next(error);
    }
};

const getAllByCustomer = async (req, res, next) => {
    try {
        const { customerId } = req.params;
        const bookings = await bookingService.getAllByCustomer(customerId);
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Reservas del cliente obtenidas exitosamente.",
            bookings: bookings.map(toResponseDTO)
        });
    } catch(error) {
        next(error);
    }
};

// Reservas PENDIENTE DE CONFIRMAR junto con el tiempo restante antes de que
// el sistema las cancele automaticamente (plazo de 5 dias).
const getPendingWithTimeRemaining = async (req, res, next) => {
    try {
        const pending = await bookingService.getPendingWithTimeRemaining();
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Reservas pendientes de confirmar obtenidas exitosamente.",
            pendingBookings: pending.map(({ booking, expiresAt, hoursRemaining }) => ({
                booking: toResponseDTO(booking),
                expiresAt: expiresAt.toISOString(),
                hoursRemaining
            }))
        });
    } catch(error) {
        next(error);
    }
};

// Informa al personal de mostrador cuales reservas quedaron CANCELADA por no
// haberse pagado dentro del plazo de 5 dias.
const getAutoCancelledBookings = async (req, res, next) => {
    try {
        const cancelledBookings = await bookingService.getAutoCancelledBookings();
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Reservas canceladas automaticamente obtenidas exitosamente.",
            bookings: cancelledBookings.map(toResponseDTO)
        });
    } catch(error) {
        next(error);
    }
};

module.exports = { create, confirmPayment, getById, getAll, getAllByCustomer, getPendingWithTimeRemaining, getAutoCancelledBookings };
