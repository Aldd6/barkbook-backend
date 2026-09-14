const customerService = require('./customer.service.js');
const authService = require('../Auth/auth.service.js');
const CreateCustomerDTO = require('./DTOs/create-customer.js');
const UpdateCustomerDTO = require('./DTOs/update-customer.js');
const CustomerResponseDTO = require('./DTOs/customer-response.js');
const { setRefreshTokenCookie } = require('../../shared/utils/cookies.js');

const toResponseDTO = (customer) => CustomerResponseDTO.parse({
    id: customer.id,
    userId: customer.userId,
    cityId: customer.cityId,
    name: customer.name,
    lastname: customer.lastname,
    dpiNumber: customer.dpiNumber,
    nitOrCf: customer.nitOrCf,
    nitNumber: customer.nitNumber,
    addressLineOne: customer.addressLineOne,
    addressLineTwo: customer.addressLineTwo,
    phoneNumber: customer.phoneNumber,
    profilePicture: customer.profilePicture,
    termsAcceptance: customer.termsAcceptance
});

const create = async (req, res, next) => {
    try {
        // el perfil de Customer solo lo completa el propio usuario autenticado: se ignora
        // cualquier userId que venga en el body para que nadie pueda completar el perfil
        // (y llevarse un token) de otra cuenta.
        const requestDTO = CreateCustomerDTO.parse({ ...req.body, userId: req.user.id });
        const newCustomer = await customerService.create(requestDTO);

        // completar el perfil cambia lo que lleva el token (profileCompleted, name,
        // lastname), asi que se reemite de una vez en lugar de esperar a que expire.
        const { accessToken, refreshToken } = await authService.reissueTokens(newCustomer.userId);
        setRefreshTokenCookie(res, refreshToken);

        return res.status(201).json({
            success: true,
            status: 201,
            message: "Cliente creado exitosamente.",
            customer: toResponseDTO(newCustomer),
            accessToken
        });
    } catch(error) {
        next(error);
    }
};

const update = async (req, res, next) => {
    try {
        const { id } = req.params;
        const requestDTO = UpdateCustomerDTO.parse(req.body);
        const updatedCustomer = await customerService.update(id, requestDTO);
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Cliente actualizado exitosamente.",
            customer: toResponseDTO(updatedCustomer)
        });
    } catch(error) {
        next(error);
    }
};

const remove = async (req, res, next) => {
    try {
        const { id } = req.params;
        const removedCustomer = await customerService.remove(id);
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Cliente eliminado exitosamente.",
            customer: toResponseDTO(removedCustomer)
        });
    } catch(error) {
        next(error);
    }
};

const restore = async (req, res, next) => {
    try {
        const { id } = req.params;
        const restoredCustomer = await customerService.restore(id);
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Cliente restaurado exitosamente.",
            customer: toResponseDTO(restoredCustomer)
        });
    } catch(error) {
        next(error);
    }
};

const getById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const customer = await customerService.getById(id);
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Cliente encontrado exitosamente.",
            customer: toResponseDTO(customer)
        });
    } catch(error) {
        next(error);
    }
};

const getAll = async (req, res, next) => {
    try {
        const customers = await customerService.getAll();
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Clientes obtenidos exitosamente.",
            customers: customers.map(toResponseDTO)
        });
    } catch(error) {
        next(error);
    }
};

module.exports = { create, update, remove, restore, getById, getAll };
