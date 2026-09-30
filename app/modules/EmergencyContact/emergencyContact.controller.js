const emergencyContactService = require('./emergencyContact.service.js');
const CreateEmergencyContactDTO = require('./DTOs/create-emergency-contact.js');
const UpdateEmergencyContactDTO = require('./DTOs/update-emergency-contact.js');
const EmergencyContactResponseDTO = require('./DTOs/emergency-contact-response.js');

const toResponseDTO = (contact) => EmergencyContactResponseDTO.parse({
    id: contact.id,
    customerId: contact.customerId,
    name: contact.name,
    lastname: contact.lastname,
    kinship: contact.kinship,
    phoneNumber: contact.phoneNumber
});

const create = async (req, res, next) => {
    try {
        const requestDTO = CreateEmergencyContactDTO.parse(req.body);
        const newContact = await emergencyContactService.create(requestDTO);
        return res.status(201).json({
            success: true,
            status: 201,
            message: "Contacto de emergencia creado exitosamente.",
            emergencyContact: toResponseDTO(newContact)
        });
    } catch(error) {
        next(error);
    }
};

const update = async (req, res, next) => {
    try {
        const { id } = req.params;
        const requestDTO = UpdateEmergencyContactDTO.parse(req.body);
        const updatedContact = await emergencyContactService.update(id, requestDTO);
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Contacto de emergencia actualizado exitosamente.",
            emergencyContact: toResponseDTO(updatedContact)
        });
    } catch(error) {
        next(error);
    }
};

const remove = async (req, res, next) => {
    try {
        const { id } = req.params;
        const removedContact = await emergencyContactService.remove(id);
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Contacto de emergencia eliminado exitosamente.",
            emergencyContact: toResponseDTO(removedContact)
        });
    } catch(error) {
        next(error);
    }
};

const restore = async (req, res, next) => {
    try {
        const { id } = req.params;
        const restoredContact = await emergencyContactService.restore(id);
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Contacto de emergencia restaurado exitosamente.",
            emergencyContact: toResponseDTO(restoredContact)
        });
    } catch(error) {
        next(error);
    }
};

const getById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const contact = await emergencyContactService.getById(id);
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Contacto de emergencia encontrado exitosamente.",
            emergencyContact: toResponseDTO(contact)
        });
    } catch(error) {
        next(error);
    }
};

const getAll = async (req, res, next) => {
    try {
        const contacts = await emergencyContactService.getAll();
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Contactos de emergencia obtenidos exitosamente.",
            emergencyContacts: contacts.map(toResponseDTO)
        });
    } catch(error) {
        next(error);
    }
};

const getAllByCustomer = async (req, res, next) => {
    try {
        const { customerId } = req.params;
        const contacts = await emergencyContactService.getAllByCustomer(customerId);
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Contactos de emergencia del cliente obtenidos exitosamente.",
            emergencyContacts: contacts.map(toResponseDTO)
        });
    } catch(error) {
        next(error);
    }
};

module.exports = { create, update, remove, restore, getById, getAll, getAllByCustomer };
