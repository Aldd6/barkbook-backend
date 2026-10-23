const dbConfig = require('../../shared/utils/index.js');
const User = dbConfig.User;
const Role = dbConfig.Role;
const Customer = dbConfig.Customer;
const Employee = dbConfig.Employee;
const Permission = dbConfig.Permission;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Op = dbConfig.Sequelize.Op;
const { ApiError } = require('../../shared/utils/errors.js');
const { createClient } = require('redis');
const authConfig = require('../../shared/config/auth.js');
const defaultTTL = 1 * 24 * 60 * 60 * 1000;
const redisConfig = require('../../shared/config/redis.config.js');

let redisClient = null;
const getRedisClient = async () => {
    if(!redisClient) {
        redisClient = createClient({
            url: redisConfig.url
        });
        redisClient.on('error', (err) => {
            console.error('[REDIS]', err);
        });
        await redisClient.connect();
    }
    return redisClient;
}

const loadToRedis = async (key, value, TTL = defaultTTL) => {
    try {
        const client = await getRedisClient();
        await client.set(String(key), value, {
            PX: TTL
        });
    } catch (err) {
        throw new ApiError(`Error al conectar con Redis: ${err.message}`, "REDIS_ERROR");
    }
}

const readFromRedis = async (key) => {
    try {
        const client = await getRedisClient();
        return await client.get(String(key));
    } catch (err) {
        throw new ApiError(`Error al conectar con Redis: ${err.message}`, "REDIS_ERROR");
    }
}

const deleteFromRedis = async (key) => {
    try {
        const client = await getRedisClient();
        await client.del(String(key));
    } catch (err) {
        throw new ApiError(`Error al conectar con Redis: ${err.message}`, "REDIS_ERROR");
    }
}

const signup = async (SignUpDTO) => {
    const { username, email, password } = SignUpDTO;
    const userExistsAlready = await User.findOne({
        where: {
            [Op.or]: [
                { username: username },
                { email: email }
            ]
        }
    });
    if(userExistsAlready) throw new ApiError('El usuario o correo electronico ingresados ya estan tomados.', "RESOURCE_CONFLICT");

    const customerRole = await Role.findOne({
        where: { roleName: 'Cliente' }
    });
    if(!customerRole) throw new ApiError('El rol de usuario para cliente no pudo ser encontrado.', "RESOURCE_NOT_FOUND");

    const hash = await bcrypt.hash(password, 10);
    const newUser = await User.create({
        rolId: customerRole.id,
        username: username,
        email: email,
        hashPassword: hash
    });
    
    return newUser;
}

const userWithProfileInclude = [
    { model: Customer, required: false },
    { model: Employee, required: false },
    { model: Role }
];

const buildTokenPayload = (user) => {
    const tokenPayload = {
        id: user.id,
        username: user.username,
        roleId: user.Role.id,
        roleName: user.Role.roleName,
        profileCompleted: user.profileCompleted
    };

    if(user.Customer) {
        tokenPayload.name = user.Customer.name;
        tokenPayload.lastname = user.Customer.lastname;
    } else if (user.Employee) {
        tokenPayload.name = user.Employee.name;
        tokenPayload.lastname = user.Employee.lastname;
    }

    return tokenPayload;
}

const issueTokens = async (user) => {
    const tokenPayload = buildTokenPayload(user);

    const accessToken = jwt.sign(tokenPayload, authConfig.accessSecret, {
        expiresIn: authConfig.accessExpiresIn
    });
    const refreshToken = jwt.sign(tokenPayload, authConfig.refreshSecret, {
        expiresIn: authConfig.refreshExpiresIn
    });
    await loadToRedis(user.id, refreshToken, authConfig.cookieMaxAge);

    return { accessToken, refreshToken };
}

const signin = async (SignInDTO) => {
    const { username, email, password } = SignInDTO;

    const conditions = [];
    if(username) conditions.push({ username });
    if(email) conditions.push({ email });

    const user = await User.unscoped().findOne({
        include: userWithProfileInclude,
        where: { [Op.or]: conditions }
    });
    if(!user) throw new ApiError(`Credenciales invalidas.`, "UNAUTHENTICATED");
    const validPassword = await bcrypt.compare(password, user.hashPassword);
    if(!validPassword) throw new ApiError(`Credenciales invalidas.`, "UNAUTHENTICATED");

    return issueTokens(user);
}

const reissueTokens = async (userId) => {
    const user = await User.findByPk(userId, {
        include: userWithProfileInclude
    });
    if(!user) throw new ApiError(`El usuario con el ID ${userId} no existe.`, "RESOURCE_NOT_FOUND");

    return issueTokens(user);
}

const refresh = async (refreshToken) => {
    if(!refreshToken) throw new ApiError('No se proporciono el token de refresco.', "UNAUTHENTICATED");

    let payload;
    try {
        payload = jwt.verify(refreshToken, authConfig.refreshSecret);
    } catch(err) {
        throw new ApiError('Token de refresco invalido o vencido.', "UNAUTHENTICATED");
    }

    const storedToken = await readFromRedis(payload.id);
    if(!storedToken || storedToken !== refreshToken) {
        throw new ApiError('Token de refresco invalido o vencido.', "UNAUTHENTICATED");
    }

    const user = await User.findByPk(payload.id, { include: userWithProfileInclude });
    if(!user) throw new ApiError('Token de refresco invalido o vencido.', "UNAUTHENTICATED");

    return issueTokens(user);
}

const signout = async (refreshToken) => {
    if(!refreshToken) return;

    let payload;
    try {
        payload = jwt.verify(refreshToken, authConfig.refreshSecret);
    } catch(err) {
        return;
    }

    const storedToken = await readFromRedis(payload.id);
    if(storedToken === refreshToken) {
        await deleteFromRedis(payload.id);
    }
}

const me = async (userId) => {
    const user = await User.findByPk(userId, {
        include: [
            { model: Customer, required: false },
            { model: Employee, required: false },
            { model: Role, include: [{ model: Permission, through: { attributes: [] }, required: false }] }
        ]
    });
    if(!user) throw new ApiError('El usuario de la sesion ya no existe.', "UNAUTHENTICATED");
    return user;
}

const revokeSessions = async (userId) => {
    await deleteFromRedis(userId);
}

module.exports = { signup, signin, reissueTokens, refresh, signout, me, revokeSessions };