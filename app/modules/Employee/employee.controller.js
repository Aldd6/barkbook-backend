const employeeService = require('./employee.service.js');
const CreateEmployeeDTO = require('./DTOs/create-employee.js');
const UpdateEmployeeDTO = require('./DTOs/update-employee.js');
const AssignEmployeeUserDTO = require('./DTOs/assign-employee-user.js');
const EmployeeResponseDTO = require('./DTOs/employee-response.js');

const toResponseDTO = (employee) => EmployeeResponseDTO.parse({
    id: employee.id,
    userId: employee.userId,
    branchId: employee.branchId,
    cityId: employee.cityId,
    name: employee.name,
    lastname: employee.lastname,
    dpiNumber: employee.dpiNumber,
    addressLineOne: employee.addressLineOne,
    addressLineTwo: employee.addressLineTwo,
    phoneNumber: employee.phoneNumber,
    profilePicture: employee.profilePicture
});

const create = async (req, res, next) => {
    try {
        const requestDTO = CreateEmployeeDTO.parse(req.body);
        const newEmployee = await employeeService.create(requestDTO);
        return res.status(201).json({
            success: true,
            status: 201,
            message: "Empleado creado exitosamente.",
            employee: toResponseDTO(newEmployee)
        });
    } catch(error) {
        next(error);
    }
};

const update = async (req, res, next) => {
    try {
        const { id } = req.params;
        const requestDTO = UpdateEmployeeDTO.parse(req.body);
        const updatedEmployee = await employeeService.update(id, requestDTO);
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Empleado actualizado exitosamente.",
            employee: toResponseDTO(updatedEmployee)
        });
    } catch(error) {
        next(error);
    }
};

const remove = async (req, res, next) => {
    try {
        const { id } = req.params;
        const removedEmployee = await employeeService.remove(id);
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Empleado eliminado exitosamente.",
            employee: toResponseDTO(removedEmployee)
        });
    } catch(error) {
        next(error);
    }
};

const restore = async (req, res, next) => {
    try {
        const { id } = req.params;
        const restoredEmployee = await employeeService.restore(id);
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Empleado restaurado exitosamente.",
            employee: toResponseDTO(restoredEmployee)
        });
    } catch(error) {
        next(error);
    }
};

const getById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const employee = await employeeService.getById(id);
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Empleado encontrado exitosamente.",
            employee: toResponseDTO(employee)
        });
    } catch(error) {
        next(error);
    }
};

const getAll = async (req, res, next) => {
    try {
        const employees = await employeeService.getAll();
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Empleados obtenidos exitosamente.",
            employees: employees.map(toResponseDTO)
        });
    } catch(error) {
        next(error);
    }
};

const assignUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { userId } = AssignEmployeeUserDTO.parse(req.body);
        const employee = await employeeService.assignUser(id, userId);
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Usuario asignado al empleado exitosamente.",
            employee: toResponseDTO(employee)
        });
    } catch(error) {
        next(error);
    }
};

module.exports = { create, update, remove, restore, getById, getAll, assignUser };
