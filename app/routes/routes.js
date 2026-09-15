const { Router } = require('express');

const authRoutes = require('../modules/Auth/auth.routes.js');
const userRoutes = require('../modules/Users/user.routes.js');
const customerRoutes = require('../modules/Customer/customer.routes.js');
const employeeRoutes = require('../modules/Employee/employee.routes.js');
const emergencyContactRoutes = require('../modules/EmergencyContact/emergencyContact.routes.js');
const petRoutes = require('../modules/Pet/pet.routes.js');
const petDietRoutes = require('../modules/Pet/petDiet.routes.js');
const petSanityRoutes = require('../modules/Pet/petSanity.routes.js');
const petVaccineRoutes = require('../modules/Pet/petVaccine.routes.js');
const branchRoutes = require('../modules/Branch/branch.routes.js');
const roomTypeRoutes = require('../modules/Room/roomType.routes.js');
const roomBranchRoutes = require('../modules/Room/roomBranch.routes.js');
const roomInventoryRoutes = require('../modules/Room/roomInventory.routes.js');
const bookingRoutes = require('../modules/Booking/booking.routes.js');
const addressRoutes = require('../modules/Address/address.routes.js');
const roleRoutes = require('../modules/Roles/role.routes.js');
const permissionRoutes = require('../modules/Permissions/permission.routes.js');

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/customers', customerRoutes);
router.use('/employees', employeeRoutes);
router.use('/emergency-contacts', emergencyContactRoutes);
router.use('/pets', petRoutes);
router.use('/pet-diets', petDietRoutes);
router.use('/pet-sanity', petSanityRoutes);
router.use('/pet-vaccines', petVaccineRoutes);
router.use('/branches', branchRoutes);
router.use('/room-types', roomTypeRoutes);
router.use('/room-branches', roomBranchRoutes);
router.use('/room-inventory', roomInventoryRoutes);
router.use('/bookings', bookingRoutes);
router.use('/address', addressRoutes);
router.use('/roles', roleRoutes);
router.use('/permissions', permissionRoutes);

module.exports = router;
