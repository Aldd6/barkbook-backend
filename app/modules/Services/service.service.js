const dbConnection = require('../../shared/utils/index.js');
const Service = dbConnection.Service;
const ServiceBranch = dbConnection.ServiceBranch;
const Booking = dbConnection.Booking;
const RoomBranch = dbConnection.RoomBranch;
const RoomType = dbConnection.RoomType;
const Op = dbConnection.Sequelize.Op;
const { ApiError } = require('../../shared/utils/errors.js');

const create = async (createServiceDTO) => {
    const { name } = createServiceDTO;

    const nameExists = await Service.findOne({ where: { name }, paranoid: false });
    if(nameExists) throw new ApiError(`Ya existe un servicio con el nombre ${name}${nameExists.isSoftDeleted() ? ' (archivado, puede restaurarlo)' : ''}.`, "RESOURCE_CONFLICT");

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

const getAvailableForBooking = async (bookingId) => {
    const booking = await Booking.findByPk(bookingId);
    if(!booking) throw new ApiError(`La reserva con el ID ${bookingId} no existe.`, "RESOURCE_NOT_FOUND");

    const roomBranch = await RoomBranch.findByPk(booking.branchRoomId, { paranoid: false });
    if(!roomBranch) throw new ApiError(`La configuracion de habitaciones de la reserva #${bookingId} no existe.`, "RESOURCE_NOT_FOUND");
    const roomType = await RoomType.findByPk(roomBranch.roomTypeId, { paranoid: false });

    const serviceBranches = await ServiceBranch.findAll({
        where: { branchId: roomBranch.branchId },
        include: [{
            model: Service,
            required: true,
            where: roomType ? { [Op.or]: [{ speciesType: null }, { speciesType: roomType.speciesType }] } : undefined
        }]
    });
    return serviceBranches.map(serviceBranch => serviceBranch.Service);
}

module.exports = { create, update, remove, restore, getById, getAll, getAvailableForBooking };
