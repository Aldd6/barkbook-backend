const employeeService = require('./employee.service.js');
const CreateEmployeeDTO = require('./DTOs/create-employee.js');
const UpdateEmployeeDTO = require('./DTOs/update-employee.js');
const AssignEmployeeUserDTO = require('./DTOs/assign-employee-user.js');
const UpdateEmployeePasswordDTO = require('./DTOs/update-employee-password.js');
const EmployeeResponseDTO = require('./DTOs/employee-response.js');
const { getFileUrl } = require('../../shared/config/s3.js');

const toResponseDTO = async (employee) => EmployeeResponseDTO.parse({
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
    profilePicture: await getFileUrl(employee.profilePicture)
});

const create = async (req, res, next) => {
    try {
        const requestDTO = CreateEmployeeDTO.parse(req.body);
        const newEmployee = await employeeService.create(requestDTO);
        return res.status(201).json({
            success: true,
            status: 201,
            message: "Empleado creado exitosamente.",
            employee: await toResponseDTO(newEmployee)
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
            employee: await toResponseDTO(updatedEmployee)
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
            employee: await toResponseDTO(removedEmployee)
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
            employee: await toResponseDTO(restoredEmployee)
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
            employee: await toResponseDTO(employee)
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
            employees: await Promise.all(employees.map(toResponseDTO))
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
            employee: await toResponseDTO(employee)
        });
    } catch(error) {
        next(error);
    }
};

const updatePassword = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { password } = UpdateEmployeePasswordDTO.parse(req.body);
        const employee = await employeeService.updatePassword(id, password);
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Contrasena del usuario del empleado actualizada exitosamente. Sus sesiones activas fueron cerradas.",
            employee: await toResponseDTO(employee)
        });
    } catch(error) {
        next(error);
    }
};

const revokeUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const employee = await employeeService.revokeUser(id);
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Usuario desvinculado del empleado exitosamente. Sus sesiones activas fueron cerradas.",
            employee: await toResponseDTO(employee)
        });
    } catch(error) {
        next(error);
    }
};

const updateProfilePicture = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updated = await employeeService.updateProfilePicture(id, req.file);
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Foto de perfil del empleado actualizada exitosamente.",
            employee: await toResponseDTO(updated)
        });
    } catch(error) {
        next(error);
    }
};

const removeProfilePicture = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updated = await employeeService.removeProfilePicture(id);
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Foto de perfil del empleado eliminada exitosamente.",
            employee: await toResponseDTO(updated)
        });
    } catch(error) {
        next(error);
    }
};

module.exports = { create, update, remove, restore, getById, getAll, assignUser, updatePassword, revokeUser, updateProfilePicture, removeProfilePicture };
