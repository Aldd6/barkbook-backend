const dbConnection = require('../../shared/utils/index.js');
const Customer = dbConnection.Customer;
const User = dbConnection.User;
const City = dbConnection.City;
const sequelize = dbConnection.sequelize;
const { ApiError } = require('../../shared/utils/errors.js');

// Al crear el perfil de Customer se completa el perfil del usuario: a
// diferencia de Employee (donde un admin asigna el usuario despues), aqui
// el propio usuario ya autenticado llena su perfil en su primer login, y
// ese create es lo que marca profileCompleted = true (habilitando, a futuro
// cuando exista auth, el acceso normal en el siguiente login).
const create = async (createCustomerDTO) => {
    const { userId, cityId, name, lastname, dpiNumber, nitOrCf, nitNumber, addressLineOne, addressLineTwo, phoneNumber, profilePicture, termsAcceptance } = createCustomerDTO;

    const user = await User.findByPk(userId);
    if(!user) throw new ApiError(`El usuario con el ID ${userId} no existe.`, "RESOURCE_NOT_FOUND");

    const customerAlreadyExists = await Customer.findOne({ where: { userId } });
    if(customerAlreadyExists) throw new ApiError(`El usuario con el ID ${userId} ya tiene un perfil de cliente.`, "RESOURCE_CONFLICT");

    const cityExists = await City.findByPk(cityId);
    if(!cityExists) throw new ApiError(`El municipio con el ID ${cityId} no existe.`, "RESOURCE_NOT_FOUND");

    const dpiExists = await Customer.findOne({ where: { dpiNumber } });
    if(dpiExists) throw new ApiError(`El DPI ${dpiNumber} ya esta registrado.`, "RESOURCE_CONFLICT");

    // Un cliente CF no debe arrastrar un nitNumber, sin importar que se haya enviado.
    const normalizedNitNumber = nitOrCf ? nitNumber : null;

    const newCustomer = await sequelize.transaction(async (transaction) => {
        const customer = await Customer.create({
            userId,
            cityId,
            name,
            lastname,
            dpiNumber,
            nitOrCf,
            nitNumber: normalizedNitNumber,
            addressLineOne,
            addressLineTwo,
            phoneNumber,
            profilePicture,
            termsAcceptance
        }, { transaction });

        await user.update({ profileCompleted: true }, { transaction });

        return customer;
    });

    return newCustomer;
}

const update = async (id, updateCustomerDTO) => {
    const customer = await Customer.findByPk(id);
    if(!customer) throw new ApiError(`El cliente con el ID ${id} no existe.`, "RESOURCE_NOT_FOUND");

    if(updateCustomerDTO.cityId) {
        const cityExists = await City.findByPk(updateCustomerDTO.cityId);
        if(!cityExists) throw new ApiError(`El municipio con el ID ${updateCustomerDTO.cityId} no existe.`, "RESOURCE_NOT_FOUND");
    }

    // El update es parcial, asi que la consistencia nitOrCf/nitNumber se
    // resuelve combinando lo que ya esta guardado con lo que llega nuevo.
    const effectiveNitOrCf = updateCustomerDTO.nitOrCf ?? customer.nitOrCf;
    const effectiveNitNumber = updateCustomerDTO.nitNumber ?? customer.nitNumber;

    if(effectiveNitOrCf && !effectiveNitNumber) {
        throw new ApiError("El numero de NIT es obligatorio cuando el cliente factura con NIT.", "INVALID_INPUT");
    }

    const dataToUpdate = { ...updateCustomerDTO };
    if('nitOrCf' in dataToUpdate || 'nitNumber' in dataToUpdate) {
        dataToUpdate.nitOrCf = effectiveNitOrCf;
        dataToUpdate.nitNumber = effectiveNitOrCf ? effectiveNitNumber : null;
    }

    await customer.update(dataToUpdate);
    return customer;
}

const remove = async (id) => {
    const customer = await Customer.findByPk(id);
    if(!customer) throw new ApiError(`El cliente con el ID ${id} no existe.`, "RESOURCE_NOT_FOUND");
    await customer.destroy();
    return customer;
}

const restore = async (id) => {
    const customer = await Customer.findOne({
        where: { id },
        paranoid: false
    });
    if(!customer) throw new ApiError(`El cliente con el ID ${id} no existe.`, "RESOURCE_NOT_FOUND");
    await customer.restore();
    return customer;
}

const getById = async (id) => {
    const customer = await Customer.findByPk(id);
    if(!customer) throw new ApiError(`El cliente con el ID ${id} no existe.`, "RESOURCE_NOT_FOUND");
    return customer;
}

const getAll = async () => {
    const customers = await Customer.findAll();
    return customers;
}

module.exports = { create, update, remove, restore, getById, getAll };
