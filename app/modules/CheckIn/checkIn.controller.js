const checkInService = require('./checkIn.service.js');
const CreateCheckInDTO = require('./DTOs/create-check-in.js');
const CheckInResponseDTO = require('./DTOs/check-in-response.js');
const CheckInPetResponseDTO = require('./DTOs/check-in-pet-response.js');
const RoomInventoryResponseDTO = require('../Room/DTOs/room-inventory-response.js');
const { CHECK_IN_STATUS } = require('../../shared/constants/enums.js');

const toResponseDTO = (checkIn) => CheckInResponseDTO.parse({
    id: checkIn.id,
    bookingId: checkIn.bookingId,
    roomInventoryId: checkIn.roomInventoryId,
    roomNumber: checkIn.RoomInventory?.roomNumber ?? null,
    checkInDate: checkIn.checkInDate,
    observations: checkIn.observations,
    status: checkIn.status,
    pets: (checkIn.CheckInPets || []).map(cp => CheckInPetResponseDTO.parse({
        id: cp.id,
        checkInId: cp.checkInId,
        bookingPetId: cp.bookingPetId,
        petId: cp.BookingPet?.petId,
        admitted: cp.admitted,
        nonadmissionReason: cp.nonadmissionReason
    }))
});

const toRoomResponseDTO = (room) => RoomInventoryResponseDTO.parse({
    id: room.id,
    roomBranchId: room.roomBranchId,
    roomNumber: room.roomNumber,
    status: room.status,
    active: room.active,
    archivedAt: room.archivadoEn ?? null
});

const create = async (req, res, next) => {
    try {
        const requestDTO = CreateCheckInDTO.parse(req.body);
        const newCheckIn = await checkInService.create(requestDTO);
        const completed = newCheckIn.status === CHECK_IN_STATUS.COMPLETADO;
        return res.status(201).json({
            success: true,
            status: 201,
            message: completed
                ? `Check-in completado exitosamente. Reserva asignada a la habitacion ${newCheckIn.RoomInventory?.roomNumber}.`
                : "Check-in cancelado: la reserva fue cancelada, el espacio reservado fue liberado y se registro el reembolso correspondiente.",
            checkIn: toResponseDTO(newCheckIn)
        });
    } catch(error) {
        next(error);
    }
};

const getAvailableRoomsForBooking = async (req, res, next) => {
    try {
        const { bookingId } = req.params;
        const rooms = await checkInService.getAvailableRoomsForBooking(bookingId);
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Habitaciones disponibles para la reserva obtenidas exitosamente.",
            roomInventory: rooms.map(toRoomResponseDTO)
        });
    } catch(error) {
        next(error);
    }
};

const getById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const checkIn = await checkInService.getById(id);
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Check-in encontrado exitosamente.",
            checkIn: toResponseDTO(checkIn)
        });
    } catch(error) {
        next(error);
    }
};

const getByBooking = async (req, res, next) => {
    try {
        const { bookingId } = req.params;
        const checkIn = await checkInService.getByBooking(bookingId);
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Check-in de la reserva encontrado exitosamente.",
            checkIn: toResponseDTO(checkIn)
        });
    } catch(error) {
        next(error);
    }
};

const getAll = async (req, res, next) => {
    try {
        const checkIns = await checkInService.getAll();
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Check-ins obtenidos exitosamente.",
            checkIns: checkIns.map(toResponseDTO)
        });
    } catch(error) {
        next(error);
    }
};

module.exports = { create, getAvailableRoomsForBooking, getById, getByBooking, getAll };
