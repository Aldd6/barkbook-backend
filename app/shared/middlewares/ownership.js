const dbConnection = require('../utils/index.js');
const { Customer, User, Employee, Pet, Booking, CheckIn, CheckOut, EmergencyContact } = dbConnection;
const { ApiError } = require('../utils/errors.js');
const { assertPermission, assertKnownPermission } = require('./authorize.js');

const CUSTOMER_ROLE_NAME = 'Cliente';

const isCustomerSession = (req) => req.user?.roleName === CUSTOMER_ROLE_NAME;

// resolvers
const findOwner = async (Model, id, getCustomerId) => {
    if(id === undefined || id === null) return undefined;
    const record = await Model.findByPk(id, { paranoid: false });
    return record ? getCustomerId(record) : undefined;
}

const byCustomer = (getId) => async (req) => getId(req);
const byPet = (getId) => async (req) => findOwner(Pet, getId(req), pet => pet.customerId);
const byEmergencyContact = (getId) => async (req) => findOwner(EmergencyContact, getId(req), contact => contact.customerId);
const byBooking = (getId) => async (req) => findOwner(Booking, getId(req), booking => booking.customerId);
const byCheckIn = (getId) => async (req) => findOwner(CheckIn, getId(req), checkIn => byBooking(() => checkIn.bookingId)(req));
const byCheckOut = (getId) => async (req) => findOwner(CheckOut, getId(req), checkOut => byCheckIn(() => checkOut.checkInId)(req));
// Registros de expediente de la mascota (PetDiet, PetSanity, PetVaccine).
const byPetRecord = (Model, getId) => async (req) => findOwner(Model, getId(req), record => byPet(() => record.petId)(req));

// Para una sesion de Cliente, exige que el recurso resuelto pertenezca a su
// perfil de cliente.
const ensureCustomerOwnership = (resolveCustomerId) => async (req, res, next) => {
    try {
        if(!isCustomerSession(req)) return next();

        const customer = await Customer.findOne({ where: { userId: req.user.id } });
        if(!customer) return next(new ApiError('Debe completar su perfil de cliente antes de acceder a este recurso.', "UNAUTHORIZED_ACCESS"));

        const ownerCustomerId = await resolveCustomerId(req);
        if(ownerCustomerId !== undefined && Number(ownerCustomerId) !== customer.id) {
            return next(new ApiError('No tiene acceso a recursos de otro cliente.', "UNAUTHORIZED_ACCESS"));
        }

        next();
    } catch(err) {
        next(err);
    }
};

// garantiza que una sesion opere su propio usuario
const ensureSelfUser = (getUid, permissionName) => {
    assertKnownPermission(permissionName);
    return async (req, res, next) => {
        try {
            const user = await User.findOne({ where: { uid: getUid(req) }, paranoid: false });
            if(!user || user.id === req.user.id) return next();

            if(isCustomerSession(req)) {
                return next(new ApiError('No tiene acceso a la cuenta de otro usuario.', "UNAUTHORIZED_ACCESS"));
            }
            await assertPermission(req.user, permissionName);
            next();
        } catch(err) {
            next(err);
        }
    };
};

// garantiza que un empleado opere su propio perfil; el de otro requiere el permiso
const ensureSelfEmployee = (getId, permissionName) => {
    assertKnownPermission(permissionName);
    return async (req, res, next) => {
        try {
            const employee = await Employee.findByPk(getId(req), { paranoid: false });
            if(employee && employee.userId === req.user.id) return next();

            await assertPermission(req.user, permissionName);
            next();
        } catch(err) {
            next(err);
        }
    };
};

//Un cliente debe usar en su lugar los endpoints filtrados por su propio customerId.
const denyCustomers = (req, res, next) => {
    if(isCustomerSession(req)) return next(new ApiError('No tiene permisos para realizar esta accion.', "UNAUTHORIZED_ACCESS"));
    next();
};

module.exports = {
    ensureCustomerOwnership,
    ensureSelfUser,
    ensureSelfEmployee,
    denyCustomers,
    byCustomer,
    byPet,
    byEmergencyContact,
    byBooking,
    byCheckIn,
    byCheckOut,
    byPetRecord
};
