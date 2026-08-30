const userService = require('./user.service.js');
const UserResponseDTO = require('./DTOs/user-response.js');
const CreateUserDTO = require('./DTOs/create-user.js');
const UpdateUserDTO = require('./DTOs/update-user.js');

const create = async (req, res, next) => {
    try {
        const requestDTO = new CreateUserDTO(req.body);
        const newUser = await userService.create(requestDTO);
        const responseDTO = new UserResponseDTO(newUser);
        return res.status(201).json({
            success: true,
            status: 201,
            user: responseDTO
        });
    } catch(error) {
        next(error);
    }
};

const update = async (req, res, next) => {
    try {
        const { uid } = req.params;
        const requestDTO = new UpdateUserDTO(req.body);

        const updatedUser = await userService.update(uid, requestDTO);

        const responseDTO = new UserResponseDTO(updatedUser);

        return res.status(200).json({
            success: true,
            status: 200,
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

        const responseDTO = new UserResponseDTO(removedUser);
        return res.status(200).json({
            success: true,
            status: 200,
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

        const responseDTO = new UserResponseDTO(searchedUser);
        return res.status(200).json({
            success: true,
            status: 200,
            user: responseDTO
        });
    } catch(error) {
        next(error);
    }
}

const getAllUsers = async (req, res, next) => {
    try {
        const users = await userService.getAll();
        const responseDTO = UserResponseDTO.fromList(users);
        return res.status(200).json({
            success: true,
            status: 200,
            users: responseDTO
        });
    } catch(error) {
        next(error);
    }
}

module.exports = { create, update, remove, getUserByUid, getAllUsers };