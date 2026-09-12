const dbConnection = require('../../shared/utils/index.js');
const EmergencyContact = dbConnection.EmergencyContact;
const Customer = dbConnection.Customer;
const { ApiError } = require('../../shared/utils/errors.js');

const create = async (createEmergencyContactDTO) => {
    const { customerId, name, lastname, kinship, phoneNumber } = createEmergencyContactDTO;

    const customerExists = await Customer.findByPk(customerId);
    if(!customerExists) throw new ApiError(`El cliente con el ID ${customerId} no existe.`, "RESOURCE_NOT_FOUND");

    const newContact = await EmergencyContact.create({ customerId, name, lastname, kinship, phoneNumber });
    return newContact;
}

const update = async (id, updateEmergencyContactDTO) => {
    const contact = await EmergencyContact.findByPk(id);
    if(!contact) throw new ApiError(`El contacto de emergencia con el ID ${id} no existe.`, "RESOURCE_NOT_FOUND");

    await contact.update(updateEmergencyContactDTO);
    return contact;
}

const remove = async (id) => {
    const contact = await EmergencyContact.findByPk(id);
    if(!contact) throw new ApiError(`El contacto de emergencia con el ID ${id} no existe.`, "RESOURCE_NOT_FOUND");
    await contact.destroy();
    return contact;
}

const restore = async (id) => {
    const contact = await EmergencyContact.findOne({
        where: { id },
        paranoid: false
    });
    if(!contact) throw new ApiError(`El contacto de emergencia con el ID ${id} no existe.`, "RESOURCE_NOT_FOUND");
    await contact.restore();
    return contact;
}

const getById = async (id) => {
    const contact = await EmergencyContact.findByPk(id);
    if(!contact) throw new ApiError(`El contacto de emergencia con el ID ${id} no existe.`, "RESOURCE_NOT_FOUND");
    return contact;
}

const getAll = async () => {
    const contacts = await EmergencyContact.findAll();
    return contacts;
}

const getAllByCustomer = async (customerId) => {
    const customerExists = await Customer.findByPk(customerId);
    if(!customerExists) throw new ApiError(`El cliente con el ID ${customerId} no existe.`, "RESOURCE_NOT_FOUND");

    const contacts = await EmergencyContact.findAll({ where: { customerId } });
    return contacts;
}

module.exports = { create, update, remove, restore, getById, getAll, getAllByCustomer };
