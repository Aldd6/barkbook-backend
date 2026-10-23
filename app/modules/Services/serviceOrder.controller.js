const z = require('zod');
const serviceOrderService = require('./serviceOrder.service.js');
const CreateServiceOrderDTO = require('./DTOs/create-service-order.js');
const { CompleteServiceOrderDTO, CancelServiceOrderDTO } = require('./DTOs/resolve-service-order.js');
const ServiceOrderResponseDTO = require('./DTOs/service-order-response.js');
const BookingBillResponseDTO = require('../Booking/DTOs/booking-bill-response.js');
const { toResponseDTO: toServiceResponseDTO } = require('./service.controller.js');
const { SERVICE_ORDER_STATUS_ARRAY } = require('../../shared/constants/enums.js');

const ListQueryDTO = z.object({ status: z.enum(SERVICE_ORDER_STATUS_ARRAY).optional() });

const toResponseDTO = (order) => ServiceOrderResponseDTO.parse({
    id: order.id,
    bookingId: order.bookingId,
    branchId: order.Booking?.RoomBranch?.branchId ?? null,
    serviceId: order.serviceId,
    service: order.Service ? toServiceResponseDTO(order.Service) : null,
    status: order.status,
    amount: order.amount,
    description: order.description,
    pets: (order.ServiceOrderPets || [])
        .filter(orderPet => orderPet.Pet)
        .map(orderPet => ({ id: orderPet.Pet.id, name: orderPet.Pet.name })),
    requestedByUserId: order.requestedByUserId,
    resolvedByUserId: order.resolvedByUserId,
    resolutionNotes: order.resolutionNotes,
    requestedAt: order.creadoEn,
    resolvedAt: order.resolvedAt,
    bookingBillId: order.bookingBillId
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
        const { bookingId } = req.params;
        const requestDTO = CreateServiceOrderDTO.parse(req.body);
        const orders = await serviceOrderService.create(bookingId, requestDTO, req.user);
        return res.status(201).json({
            success: true,
            status: 201,
            message: "Servicio contratado exitosamente. Se cargara a la cuenta de la reserva cuando el cuidador lo complete.",
            serviceOrders: orders.map(toResponseDTO)
        });
    } catch(error) {
        next(error);
    }
};

const getAll = async (req, res, next) => {
    try {
        const query = ListQueryDTO.parse(req.query);
        const orders = await serviceOrderService.getAll(query, req.user);
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Ordenes de servicio obtenidas exitosamente.",
            serviceOrders: orders.map(toResponseDTO)
        });
    } catch(error) {
        next(error);
    }
};

const getByBooking = async (req, res, next) => {
    try {
        const { bookingId } = req.params;
        const orders = await serviceOrderService.getByBooking(bookingId);
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Ordenes de servicio de la reserva obtenidas exitosamente.",
            serviceOrders: orders.map(toResponseDTO)
        });
    } catch(error) {
        next(error);
    }
};

const complete = async (req, res, next) => {
    try {
        const { id } = req.params;
        const requestDTO = CompleteServiceOrderDTO.parse(req.body ?? {});
        const { order, bill, balance } = await serviceOrderService.complete(id, requestDTO, req.user);
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Servicio completado y cargado a la cuenta de la reserva.",
            serviceOrder: toResponseDTO(order),
            bill: toBillResponseDTO(bill),
            balance
        });
    } catch(error) {
        next(error);
    }
};

const cancel = async (req, res, next) => {
    try {
        const { id } = req.params;
        const requestDTO = CancelServiceOrderDTO.parse(req.body ?? {});
        const order = await serviceOrderService.cancel(id, requestDTO, req.user);
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Orden de servicio cancelada.",
            serviceOrder: toResponseDTO(order)
        });
    } catch(error) {
        next(error);
    }
};

module.exports = { create, getAll, getByBooking, complete, cancel };
