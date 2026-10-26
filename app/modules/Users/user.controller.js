const userService = require('./user.service.js');
const UserResponseDTO = require('./DTOs/user-response.js');
const CreateUserDTO = require('./DTOs/create-user.js');
const UpdateUserDTO = require('./DTOs/update-user.js');
const { CustomerUserResponseDTO, CustomerUserDetailResponseDTO } = require('./DTOs/customer-user-response.js');
const { getFileUrl } = require('../../shared/config/s3.js');

const toCustomerDTO = async (customer) => customer ? {
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
    profilePicture: await getFileUrl(customer.profilePicture),
    termsAcceptance: customer.termsAcceptance
} : null;

const toPetDTO = async (pet) => ({
    id: pet.id,
    customerId: pet.customerId,
    name: pet.name,
    species: pet.species,
    sex: pet.sex,
    birthday: pet.birthday,
    size: pet.size,
    actualWeight: pet.actualWeight,
    unitOfMeasureWeight: pet.unitOfMeasureWeight,
    sociabilityLevel: pet.sociabilityLevel,
    isNeutered: pet.isNeutered,
    vaccinationCard: await getFileUrl(pet.vaccinationCard),
    profilePicture: await getFileUrl(pet.profilePicture)
});

const create = async (req, res, next) => {
    try {
        const requestDTO = CreateUserDTO.parse(req.body);
        const newUser = await userService.create(requestDTO);
        const responseDTO = UserResponseDTO.parse({
            id: newUser.id,
            uid: newUser.uid,
            rolId: newUser.rolId,
            username: newUser.username,
            email: newUser.email,
            profileCompleted: newUser.profileCompleted
        });
        return res.status(201).json({
            success: true,
            status: 201,
            message: "Usuario creado exitosamente.",
            user: responseDTO
        });
    } catch(error) {
        next(error);
    }
};

const update = async (req, res, next) => {
    try {
        const { uid } = req.params;
        const requestDTO = UpdateUserDTO.parse(req.body);

        const updatedUser = await userService.update(uid, requestDTO);

        const responseDTO = UserResponseDTO.parse({
            id: updatedUser.id,
            uid: updatedUser.uid,
            rolId: updatedUser.rolId,
            username: updatedUser.username,
            email: updatedUser.email,
            profileCompleted: updatedUser.profileCompleted
        });

        return res.status(200).json({
            success: true,
            status: 200,
            message: "Usuario actualizado exitosamente.",
            user: responseDTO
        });
    } catch(error) {
        next(error);
    }
}

const remove = async (req, res, next) => {
    try {
        const { uid } = req.params;
        const removedUser = await userService.remove(uid);
        const responseDTO = UserResponseDTO.parse({
            id: removedUser.id,
            uid: removedUser.uid,
            rolId: removedUser.rolId,
            username: removedUser.username,
            email: removedUser.email,
            profileCompleted: removedUser.profileCompleted
        });
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Usuario eliminado exitosamente.",
            user: responseDTO
        });
    } catch(error) {
        next(error);
    }
}

const getUserByUid = async (req, res, next) => {
    try {
        const { uid } = req.params;
        const searchedUser = await userService.getByUid(uid);

        const responseDTO = UserResponseDTO.parse({
            id: searchedUser.id,
            uid: searchedUser.uid,
            rolId: searchedUser.rolId,
            username: searchedUser.username,
            email: searchedUser.email,
            profileCompleted: searchedUser.profileCompleted
        });
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Usuario encontrado exitosamente.",
            user: responseDTO
        });
    } catch(error) {
        next(error);
    }
}

const getAllUsers = async (req, res, next) => {
    try {
        const users = await userService.getAll();
        const responseDTO = users.map(usr => UserResponseDTO.parse({
            id: usr.id,
            uid: usr.uid,
            rolId: usr.rolId,
            username: usr.username,
            email: usr.email,
            profileCompleted: usr.profileCompleted
        }));
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Usuarios obtenidos exitosamente.",
            users: responseDTO
        });
    } catch(error) {
        next(error);
    }
}

const getAllCustomers = async (req, res, next) => {
    try {
        const users = await userService.getAllCustomers();
        const responseDTO = await Promise.all(users.map(async usr => CustomerUserResponseDTO.parse({
            id: usr.id,
            uid: usr.uid,
            rolId: usr.rolId,
            username: usr.username,
            email: usr.email,
            profileCompleted: usr.profileCompleted,
            customer: await toCustomerDTO(usr.Customer)
        })));
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Usuarios cliente obtenidos exitosamente.",
            users: responseDTO
        });
    } catch(error) {
        next(error);
    }
}

const getCustomerByUid = async (req, res, next) => {
    try {
        const { uid } = req.params;
        const searchedUser = await userService.getCustomerByUid(uid);
        const pets = searchedUser.Customer?.Pets ?? [];

        const responseDTO = CustomerUserDetailResponseDTO.parse({
            id: searchedUser.id,
            uid: searchedUser.uid,
            rolId: searchedUser.rolId,
            username: searchedUser.username,
            email: searchedUser.email,
            profileCompleted: searchedUser.profileCompleted,
            customer: await toCustomerDTO(searchedUser.Customer),
            pets: await Promise.all(pets.map(toPetDTO))
        });
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Usuario cliente encontrado exitosamente.",
            user: responseDTO
        });
    } catch(error) {
        next(error);
    }
}

module.exports = { create, update, remove, getUserByUid, getAllUsers, getAllCustomers, getCustomerByUid };