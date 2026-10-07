const z = require('zod');
const CustomerResponseDTO = require('../../Customer/DTOs/customer-response.js');
const EmployeeResponseDTO = require('../../Employee/DTOs/employee-response.js');

const MeResponseDTO = z.object({
    user: z.object({
        id: z.number(),
        uid: z.uuidv4(),
        username: z.string(),
        email: z.email(),
        rolId: z.number(),
        roleName: z.string(),
        profileCompleted: z.boolean()
    }),
    // null si el usuario aun no completa su perfil (o no es cliente/empleado).
    customer: CustomerResponseDTO.nullable(),
    employee: EmployeeResponseDTO.nullable(),
    // permissionName de cada permiso del rol (el Administrador pasa todos los chequeos igual).
    permissions: z.array(z.string())
});

module.exports = MeResponseDTO;
