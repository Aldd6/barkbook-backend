const dbConnection = require('../../shared/utils/index.js');
const Service = dbConnection.Service;
const ServiceBranch = dbConnection.ServiceBranch;
const Booking = dbConnection.Booking;
const BookingPet = dbConnection.BookingPet;
const BookingBill = dbConnection.BookingBill;
const CheckIn = dbConnection.CheckIn;
const CheckInPet = dbConnection.CheckInPet;
const RoomBranch = dbConnection.RoomBranch;
const Pet = dbConnection.Pet;
const Customer = dbConnection.Customer;
const sequelize = dbConnection.sequelize;
const Op = dbConnection.Sequelize.Op;
const { ApiError } = require('../../shared/utils/errors.js');
const { BOOKING_STATUS, CHECK_IN_STATUS, MOVEMENT_TYPE } = require('../../shared/constants/enums.js');

// Rol asignado por Auth.signup a los clientes finales.
const CUSTOMER_ROLE_NAME = 'Cliente';

const roundMoney =(value) => Math.round(value * 100) / 100;

const sumByMovement = (bills, movementType) => bills
    .filter(bill => bill.movementType === movementType)
    .reduce((sum, bill) => sum + parseFloat(bill.amount), 0);

const create = async (createServiceDTO) => {
    const { name } = createServiceDTO;

    const nameExists = await Service.findOne({ where: { name }, paranoid: false });
    if(nameExists) throw new ApiError(`Ya existe un servicio con el nombre ${name}${nameExists.deletedAt ? ' (archivado, puede restaurarlo)' : ''}.`, "RESOURCE_CONFLICT");

    const newService = await Service.create(createServiceDTO);
    return newService;
}

const update = async (id, updateServiceDTO) => {
    const service = await Service.findByPk(id);
    if(!service) throw new ApiError(`El servicio con el ID ${id} no existe.`, "RESOURCE_NOT_FOUND");

    if(updateServiceDTO.name && updateServiceDTO.name !== service.name) {
        const nameExists = await Service.findOne({
            where: {
                name: updateServiceDTO.name,
                id: { [Op.ne]: id }
            },
            paranoid: false
        });
        if(nameExists) throw new ApiError(`Ya existe un servicio con el nombre ${updateServiceDTO.name}.`, "RESOURCE_CONFLICT");
    }

    await service.update(updateServiceDTO);
    return service;
}

const remove = async (id) => {
    const service = await Service.findByPk(id);
    if(!service) throw new ApiError(`El servicio con el ID ${id} no existe.`, "RESOURCE_NOT_FOUND");
    await service.destroy();
    return service;
}

const restore = async (id) => {
    const service = await Service.findOne({
        where: { id },
        paranoid: false
    });
    if(!service) throw new ApiError(`El servicio con el ID ${id} no existe.`, "RESOURCE_NOT_FOUND");
    await service.restore();
    return service;
}

const getById = async (id) => {
    const service = await Service.findByPk(id);
    if(!service) throw new ApiError(`El servicio con el ID ${id} no existe.`, "RESOURCE_NOT_FOUND");
    return service;
}

const getAll = async () => {
    const services = await Service.findAll();
    return services;
}

// Carga un servicio del catalogo a la cuenta de una reserva EN ESTANCIA. El
// cargo queda sin metodo de pago y se salda despues con confirm-payment antes
// del check-out. Un Cliente solo puede cargar servicios a sus propias
// reservas; el personal del hotel puede cargarlos a cualquiera.
const chargeToBooking = async (bookingId, chargeServiceDTO, sessionUser) => {
    const { serviceId, petIds, description } = chargeServiceDTO;

    return await sequelize.transaction(async (transaction) => {
        const booking = await Booking.findByPk(bookingId, { transaction, lock: transaction.LOCK.UPDATE });
        if(!booking) throw new ApiError(`La reserva con el ID ${bookingId} no existe.`, "RESOURCE_NOT_FOUND");

        if(sessionUser?.roleName === CUSTOMER_ROLE_NAME) {
            const customer = await Customer.findOne({ where: { userId: sessionUser.id }, transaction });
            if(!customer || booking.customerId !== customer.id) {
                throw new ApiError(`La reserva #${bookingId} no pertenece al cliente de la sesion.`, "UNAUTHORIZED_ACCESS");
            }
        }
        if(booking.bookingStatus !== BOOKING_STATUS.ENES) {
            throw new ApiError(`Solo se pueden cargar servicios a una reserva en estado "${BOOKING_STATUS.ENES}". Estado actual: "${booking.bookingStatus}".`, "RESOURCE_CONFLICT");
        }

        const service = await Service.findByPk(serviceId, { transaction });
        if(!service) throw new ApiError(`El servicio con el ID ${serviceId} no existe.`, "RESOURCE_NOT_FOUND");

        // El servicio debe estar habilitado en la sede donde se hospeda la reserva.
        const roomBranch = await RoomBranch.findByPk(booking.branchRoomId, { transaction, paranoid: false });
        if(!roomBranch) throw new ApiError(`La configuracion de habitaciones de la reserva #${bookingId} no existe.`, "RESOURCE_NOT_FOUND");
        const offeredAtBranch = await ServiceBranch.findOne({
            where: { branchId: roomBranch.branchId, serviceId },
            transaction
        });
        if(!offeredAtBranch) {
            throw new ApiError(`El servicio "${service.name}" no se presta en la sede de la reserva #${bookingId}.`, "RESOURCE_CONFLICT");
        }

        // Solo las mascotas admitidas en el check-in pueden recibir servicios.
        const checkIn = await CheckIn.findOne({
            where: { bookingId, status: CHECK_IN_STATUS.COMPLETADO },
            include: [{
                model: CheckInPet,
                where: { admitted: true },
                required: false,
                include: [{ model: BookingPet, include: [{ model: Pet, paranoid: false }] }]
            }],
            transaction
        });
        const admittedPets = (checkIn?.CheckInPets || []).map(checkInPet => checkInPet.BookingPet.Pet);
        if(admittedPets.length === 0) {
            throw new ApiError(`La reserva #${bookingId} no tiene mascotas admitidas en su check-in.`, "RESOURCE_CONFLICT");
        }

        let servedPets = admittedPets;
        if(petIds) {
            const uniquePetIds = [...new Set(petIds)];
            servedPets = admittedPets.filter(pet => uniquePetIds.includes(pet.id));
            if(servedPets.length !== uniquePetIds.length) {
                throw new ApiError(`Una o mas mascotas no estan admitidas en la estancia de la reserva #${bookingId}.`, "INVALID_INPUT");
            }
        }

        if(service.speciesType) {
            const wrongSpecies = servedPets.filter(pet => pet.species !== service.speciesType);
            if(wrongSpecies.length > 0) {
                throw new ApiError(`El servicio "${service.name}" solo aplica a la especie ${service.speciesType}; no se puede cargar a: ${wrongSpecies.map(pet => pet.name).join(', ')}.`, "INVALID_INPUT");
            }
        }

        const quantity = service.isMultiGuest ? 1 : servedPets.length;
        const amount = roundMoney(parseFloat(service.rate) * quantity);
        const petNames = servedPets.map(pet => pet.name).join(', ');

        const bill = await BookingBill.create({
            bookingId: booking.id,
            serviceId: service.id,
            quantity,
            movementType: MOVEMENT_TYPE.CARGO,
            amount,
            methodPayment: null,
            reference: null,
            description: description || `Cargo por servicio "${service.name}" (${quantity} x Q${service.rate}) - Reserva #${booking.id}. Mascota(s): ${petNames}.`.slice(0, 255)
        }, { transaction });

        const bills = await BookingBill.findAll({ where: { bookingId: booking.id }, transaction });
        const balance = roundMoney(sumByMovement(bills, MOVEMENT_TYPE.CARGO) - sumByMovement(bills, MOVEMENT_TYPE.ABONO));

        return { bill, balance };
    });
}

module.exports = { create, update, remove, restore, getById, getAll, chargeToBooking };
