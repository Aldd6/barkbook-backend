const z = require('zod');

const AssignEmployeeUserDTO = z.object({
    userId: z.number()
});

module.exports = AssignEmployeeUserDTO;
