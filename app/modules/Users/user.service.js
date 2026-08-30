const dbConnection = require('../../shared/utils/index.js');
const User = dbConnection.User;
const Role = dbConnection.Role;
const bcrypt = require('bcryptjs');
const ApiError = require('../../shared/utils/errors.js');
const Op = dbConnection.Sequelize.Op;

const createUser = async (createUserDTO) => {
    const { rolId, username, email, password } = createUserDTO;

    const roleExists = await Role.findByPk(rolId);
    if(!roleExists) throw new ApiError("El id del rol asignado no existe.", "RESOURCE_NOT_FOUND");

    const userExists = await User.findOne({
        where: { [Op.or]: [{ email }, { username }] }
    });
    if(userExists) throw new ApiError("El correo electronico o el nombre de usaurio ya esta registrado.", "RESOURCE_CONFLICT");

    const hash = await bcrypt.hash(password, 10);
    const newUser = await User.create({
        rolId,
        username,
        email,
        hashPassword: hash
    });
    return newUser;
}

const updateUser = async (uid, updateUserDTO) => {
    const user = await User.findOne({ where: { uid: uid } });
    if(!user) throw new ApiError(`El usuario con el UID ${uid} no existe.`, "RESOURCE_NOT_FOUND");

    const updateData = { ...updateUserDTO };
    if(updateUserDTO.rolId) {
        const rolId = updateData.rolId;
        const roleExists = await Role.findByPk(rolId);
        if(!roleExists) throw new ApiError(`El rol con el ID ${rolId} no existe.`, "RESOURCE_NOT_FOUND")
    }
    if(updateUserDTO.email || updateUserDTO.username) {
        const conditions = [];
        if(updateUserDTO.email && updateUserDTO.email !== user.email) conditions.push({ email: updateData.email });
        if(updateUserDTO.username && updateUserDTO !== user.username) conditions.push({ username: updateData.user });
        if(conditions.length > 0) {
            const existsDuplicated = await User.findOne({
                where: {
                    [Op.or]: conditions,
                    uid: { [Op.ne]: uid }
                }
            });
            if(existsDuplicated) throw new ApiError("La direccion de correo electronico o el nombre de usuario ya esta registrado por otro usuario.", "RESOURCE_CONFLICT");
        }
    }
    if(updateUserDTO.password) {
        updateData.hashPassword = await bcrypt.hash(updateData.password, 10);
        delete updateData.password;
    }

    await user.update(updateData);
    return user;
}

const deleteUser = async (uid) => {
    const user = await User.findOne({ where: { uid: uid } });
    if(!user) throw new ApiError(`El usuario con el UID ${uid} no existe.`, "RESOURCE_NOT_FOUND");

    await user.destroy();
    return user;
}

const getUserByUid = async (uid) => {
    const user = await User.findOne({ where: { uid: uid } });
    if(!user) {
        throw new ApiError(`El usuario con el UID ${uid} no existe.`, "RESOURCE_NOT_FOUND");
    }
    return user;
}

const getAllUsers = async () => {
    const users = await User.findAll();
    return users;
}