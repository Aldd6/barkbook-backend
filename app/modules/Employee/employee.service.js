const dbConnection = require('../../shared/utils/index.js');
const Employee = dbConnection.Employee;
const User = dbConnection.User;
const Branch = dbConnection.Branch;
const City = dbConnection.City;
const sequelize = dbConnection.sequelize;
const { ApiError } = require('../../shared/utils/errors.js');

const create = async (createEmployeeDTO) => {
    const { branchId, cityId, name, lastname, dpiNumber, addressLineOne, addressLineTwo, phoneNumber, profilePicture } = createEmployeeDTO;

    const branchExists = await Branch.findByPk(branchId);
    if(!branchExists) throw new ApiError(`La sede con el ID ${branchId} no existe.`, "RESOURCE_NOT_FOUND");

    const cityExists = await City.findByPk(cityId);
    if(!cityExists) throw new ApiError(`El municipio con el ID ${cityId} no existe.`, "RESOURCE_NOT_FOUND");

    const dpiExists = await Employee.findOne({ where: { dpiNumber } });
    if(dpiExists) throw new ApiError(`El DPI ${dpiNumber} ya esta registrado.`, "RESOURCE_CONFLICT");

    const newEmployee = await Employee.create({
        branchId,
        cityId,
        name,
        lastname,
        dpiNumber,
        addressLineOne,
        addressLineTwo,
        phoneNumber,
        profilePicture
    });
    return newEmployee;
}

const update = async (id, updateEmployeeDTO) => {
    const employee = await Employee.findByPk(id);
    if(!employee) throw new ApiError(`El empleado con el ID ${id} no existe.`, "RESOURCE_NOT_FOUND");

    if(updateEmployeeDTO.branchId) {
        const branchExists = await Branch.findByPk(updateEmployeeDTO.branchId);
        if(!branchExists) throw new ApiError(`La sede con el ID ${updateEmployeeDTO.branchId} no existe.`, "RESOURCE_NOT_FOUND");
    }

    if(updateEmployeeDTO.cityId) {
        const cityExists = await City.findByPk(updateEmployeeDTO.cityId);
        if(!cityExists) throw new ApiError(`El municipio con el ID ${updateEmployeeDTO.cityId} no existe.`, "RESOURCE_NOT_FOUND");
    }

    await employee.update(updateEmployeeDTO);
    return employee;
}

const remove = async (id) => {
    const employee = await Employee.findByPk(id);
    if(!employee) throw new ApiError(`El empleado con el ID ${id} no existe.`, "RESOURCE_NOT_FOUND");
    await employee.destroy();
    return employee;
}

const restore = async (id) => {
    const employee = await Employee.findOne({
        where: { id },
        paranoid: false
    });
    if(!employee) throw new ApiError(`El empleado con el ID ${id} no existe.`, "RESOURCE_NOT_FOUND");
    await employee.restore();
    return employee;
}

const getById = async (id) => {
    const employee = await Employee.findByPk(id);
    if(!employee) throw new ApiError(`El empleado con el ID ${id} no existe.`, "RESOURCE_NOT_FOUND");
    return employee;
}

const getAll = async () => {
    const employees = await Employee.findAll();
    return employees;
}

const assignUser = async (employeeId, userId) => {
    const employee = await Employee.findByPk(employeeId);
    if(!employee) throw new ApiError(`El empleado con el ID ${employeeId} no existe.`, "RESOURCE_NOT_FOUND");
    if(employee.userId) throw new ApiError(`El empleado con el ID ${employeeId} ya tiene un usuario asignado.`, "RESOURCE_CONFLICT");

    const user = await User.findByPk(userId);
    if(!user) throw new ApiError(`El usuario con el ID ${userId} no existe.`, "RESOURCE_NOT_FOUND");

    const userAlreadyAssigned = await Employee.findOne({ where: { userId } });
    if(userAlreadyAssigned) throw new ApiError(`El usuario con el ID ${userId} ya tiene un empleado asignado.`, "RESOURCE_CONFLICT");

    await sequelize.transaction(async (transaction) => {
        await employee.update({ userId }, { transaction });
        await user.update({ profileCompleted: true }, { transaction });
    });

    return employee;
}

module.exports = { create, update, remove, restore, getById, getAll, assignUser };
