const userService = require('./user.service.js');
const UserResponseDTO = require('./DTOs/user-response.js');
const CreateUserDTO = require('./DTOs/create-user.js');
const UpdateUserDTO = require('./DTOs/update-user.js');

const create = async (req, res, next) => {
    try {
        const requestDTO = CreateUserDTO.parse(req.body);
        const newUser = await userService.create(requestDTO);
        const responseDTO = UserResponseDTO.parse({
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
        const { uid } = req.query;
        const requestDTO = UpdateUserDTO.parse(req.body);

        const updatedUser = await userService.update(uid, requestDTO);

        const responseDTO = UserResponseDTO.parse({
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

module.exports = { create, update, remove, getUserByUid, getAllUsers };