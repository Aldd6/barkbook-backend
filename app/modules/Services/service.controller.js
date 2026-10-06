const serviceService = require('./service.service.js');
const CreateServiceDTO = require('./DTOs/create-service.js');
const UpdateServiceDTO = require('./DTOs/update-service.js');
const ChargeServiceDTO = require('./DTOs/charge-service.js');
const ServiceResponseDTO = require('./DTOs/service-response.js');
const BookingBillResponseDTO = require('../Booking/DTOs/booking-bill-response.js');

const toResponseDTO = (service) => ServiceResponseDTO.parse({
    id: service.id,
    name: service.name,
    description: service.description,
    serviceType: service.serviceType,
    speciesType: service.speciesType,
    isMultiGuest: service.isMultiGuest,
    rate: service.rate
});

const toBillResponseDTO = (bill) => BookingBillResponseDTO.parse({
    id: bill.id,
    bookingId: bill.bookingId,
    serviceId: bill.serviceId,
    quantity: bill.quantity,
    movementType: bill.movementType,
    amount: bill.amount,
    methodPayment: bill.methodPayment,
    reference: bill.reference,
    description: bill.description
});

const create = async (req, res, next) => {
    try {
        const requestDTO = CreateServiceDTO.parse(req.body);
        const newService = await serviceService.create(requestDTO);
        return res.status(201).json({
            success: true,
            status: 201,
            message: "Servicio creado exitosamente.",
            service: toResponseDTO(newService)
        });
    } catch(error) {
        next(error);
    }
};

const update = async (req, res, next) => {
    try {
        const { id } = req.params;
        const requestDTO = UpdateServiceDTO.parse(req.body);
        const updatedService = await serviceService.update(id, requestDTO);
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Servicio actualizado exitosamente.",
            service: toResponseDTO(updatedService)
        });
    } catch(error) {
        next(error);
    }
};

const remove = async (req, res, next) => {
    try {
        const { id } = req.params;
        const removedService = await serviceService.remove(id);
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Servicio eliminado exitosamente.",
            service: toResponseDTO(removedService)
        });
    } catch(error) {
        next(error);
    }
};

const restore = async (req, res, next) => {
    try {
        const { id } = req.params;
        const restoredService = await serviceService.restore(id);
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Servicio restaurado exitosamente.",
            service: toResponseDTO(restoredService)
        });
    } catch(error) {
        next(error);
    }
};

const getById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const service = await serviceService.getById(id);
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Servicio encontrado exitosamente.",
            service: toResponseDTO(service)
        });
    } catch(error) {
        next(error);
    }
};

const getAll = async (req, res, next) => {
    try {
        const services = await serviceService.getAll();
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Servicios obtenidos exitosamente.",
            services: services.map(toResponseDTO)
        });
    } catch(error) {
        next(error);
    }
};

const chargeToBooking = async (req, res, next) => {
    try {
        const { bookingId } = req.params;
        const requestDTO = ChargeServiceDTO.parse(req.body);
        const { bill, balance } = await serviceService.chargeToBooking(bookingId, requestDTO);
        return res.status(201).json({
            success: true,
            status: 201,
            message: "Servicio cargado a la cuenta de la reserva exitosamente.",
            bill: toBillResponseDTO(bill),
            balance
        });
    } catch(error) {
        next(error);
    }
};

module.exports = { create, update, remove, restore, getById, getAll, chargeToBooking };
