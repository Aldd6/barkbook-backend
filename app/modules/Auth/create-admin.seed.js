require('dotenv').config({ path: `.env.${process.env.NODE_ENV || 'development'}` });
const bcrypt = require('bcryptjs');
const dbConnection = require('../../shared/utils/index.js');
const { User, Role, sequelize } = dbConnection;
const { Op } = dbConnection.Sequelize;
const CreateUserDTO = require('../Users/DTOs/create-user.js');

const ADMIN_ROLE_NAME = 'Administrador';

const run = async () => {
    const [, , username, email, password] = process.argv;
    if(!username || !email || !password) {
        console.error('Uso: node app/modules/Auth/create-admin.seed.js <username> <email> <password>');
        process.exitCode = 1;
        return;
    }

    const parsed = CreateUserDTO.safeParse({ rolId: 0, username, email, password });
    if(!parsed.success) {
        console.error(`Datos invalidos: ${parsed.error.issues.map(issue => issue.message).join(' | ')}`);
        process.exitCode = 1;
        return;
    }

    try {
        const adminRole = await Role.findOne({ where: { roleName: ADMIN_ROLE_NAME } });
        if(!adminRole) {
            throw new Error(`El rol "${ADMIN_ROLE_NAME}" no existe. Corre primero: npm run seed:auth`);
        }

        const userExists = await User.findOne({
            where: { [Op.or]: [{ username }, { email }] }
        });
        if(userExists) {
            throw new Error(`Ya existe un usuario con ese username o email (uid: ${userExists.uid}).`);
        }

        const hashPassword = await bcrypt.hash(password, 10);
        const admin = await User.create({
            rolId: adminRole.id,
            username,
            email,
            hashPassword,
            profileCompleted: true
        });

        console.log(`Usuario Administrador creado: uid=${admin.uid}, username=${admin.username}, email=${admin.email}.`);
        console.log('Ya puedes iniciar sesion con POST /api/auth/signin.');
    } catch(err) {
        console.error(`Error al crear el usuario Administrador: ${err.message}`);
        process.exitCode = 1;
    } finally {
        await sequelize.close();
    }
};

run();
