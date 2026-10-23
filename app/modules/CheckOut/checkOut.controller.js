const checkOutService = require('./checkOut.service.js');
const CreateCheckOutDTO = require('./DTOs/create-check-out.js');
const CheckOutResponseDTO = require('./DTOs/check-out-response.js');

const toResponseDTO = (checkOut) => CheckOutResponseDTO.parse({
    id: checkOut.id,
    checkInId: checkOut.checkInId,
    bookingId: checkOut.CheckIn?.bookingId,
    roomNumber: checkOut.CheckIn?.RoomInventory?.roomNumber ?? null,
    checkOutDate: checkOut.checkOutDate.toISOString(),
    observations: checkOut.observations,
    userId: checkOut.userId
});

const create = async (req, res, next) => {
    try {
        const requestDTO = CreateCheckOutDTO.parse(req.body);
        const newCheckOut = await checkOutService.create(requestDTO, req.user?.id);
        return res.status(201).json({
            success: true,
            status: 201,
            message: "Check-out realizado exitosamente. La reserva fue finalizada y la habitacion paso a limpieza y desinfeccion.",
            checkOut: toResponseDTO(newCheckOut)
        });
    } catch(error) {
        next(error);
    }
};

const getById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const checkOut = await checkOutService.getById(id);
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Check-out encontrado exitosamente.",
            checkOut: toResponseDTO(checkOut)
        });
    } catch(error) {
        next(error);
    }
};

const getByCheckIn = async (req, res, next) => {
    try {
        const { checkInId } = req.params;
        const checkOut = await checkOutService.getByCheckIn(checkInId);
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Check-out del check-in encontrado exitosamente.",
            checkOut: toResponseDTO(checkOut)
        });
    } catch(error) {
        next(error);
    }
};

const getAll = async (req, res, next) => {
    try {
        const checkOuts = await checkOutService.getAll();
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Check-outs obtenidos exitosamente.",
            checkOuts: checkOuts.map(toResponseDTO)
        });
    } catch(error) {
        next(error);
    }
};

module.exports = { create, getById, getByCheckIn, getAll };
