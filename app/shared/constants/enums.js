const TYPE_TRANSACTION = Object.freeze({
    WRITE: "WRT",
    READ: "READ",
    UPDATE: "UPD",
    ERRASE: "ERS"
});

const METHOD_TRANSACTION = Object.freeze({
    GET: "GET",
    POST: "POST",
    PUT: "PUT",
    PATCH: "PATCH",
    DELETE: "DELETE"
});

const KINSHIP = Object.freeze({
    PDR: "PADRE/MADRE",
    HRN: "HERMANO(A)",
    PRM: "PRIMO(A)",
    ABL: "ABUELO(A)",
    PRJ: "PAREJA",
    ESP: "ESPOSO(A)",
    HJO: "HIJO(A)"
});

const PET_SPECIES = Object.freeze({
    FELINO: "FELINO",
    CANINO: "CANINO"
});

const SEX = Object.freeze({
    MACHO: "MACHO",
    HEMBRA: "HEMBRA"
});

const PET_SIZE = Object.freeze({
    PEQUENIO: "PEQUENIO",
    MEDIANO: "MEDIANO",
    GRANDE: "GRANDE",
    EXTRA: "EXTRA"
});

const UNIT_MEASURE_WEIGHT_PET = Object.freeze({
    KILOGRAMOS: "KILOGRAMOS",
    LIBRAS: "LIBRAS",
    GRAMOS: "GRAMOS"
});

const VACCINE_USE = Object.freeze({
    INM: "INMUNIZACION",
    RFE: "REFUERZO"
});

const DIET_TYPE = Object.freeze({
    CRCS: "CROQUETAS/ALIMENTO SECO",
    ALHM: "ALIMENTO HUMEDO",
    BARF: "ALIMENTO NATURAL",
    ALHB: "ALIMENTACION HIBRIDA"
});

const UNIT_MEASURE_SERVING_PET = Object.freeze({
    TAZAS: "TAZAS",
    CUCHARADAS: "CUCHARADAS",
    GRAMOS: "GRAMOS",
    MILIGRAMOS: "MILIGRAMOS",
    LIBRAS: "LIBRAS",
    ONZAS: "ONZAS"
});

const ROOM_STATUS = Object.freeze({
    DSPN: "DISPONIBLE",
    OCDA: "OCUPADA",
    MNRP: "MANTENIMIENTO/REPARACION",
    LMDS: "LIMPIEZA Y DESINFECCION",
    INTV: "INACTIVA"
});

const BOOKING_STATUS = Object.freeze({
    CNFD: "RESERVA CONFIRMADA",
    PDCN: "RESERVA PENDIENTE DE CONFIRMAR",
    ENES: "EN ESTANCIA",
    FNLZ: "FINALIZADA",
    CNCL: "CANCELADA"
});

const PAYMENT_METHOD = Object.freeze({
    TARJETA: "TARJETA CREDITO/DEBITO",
    POS: "POS",
    EFECTIVO: "EFECTIVO",
    TRANSFERENCIA: "TRANSFERENCIA"
});

const MOVEMENT_TYPE = Object.freeze({
    CARGO: "CARGO",
    ABONO: "ABONO",
    REEMBOLSO: "REEMBOLSO"
});

const CHECK_IN_STATUS = Object.freeze({
    COMPLETADO: "COMPLETADO",
    CANCELADO: "CANCELADO"
})

const CANCELLATION_STATUS = Object.freeze({
    PENDIENTE: "PENDIENTE",
    APROBADA: "APROBADA",
    RECHAZADA: "RECHAZADA"
});

const SERVICE_ORDER_STATUS = Object.freeze({
    PENDIENTE: "PENDIENTE",
    COMPLETADO: "COMPLETADO",
    CANCELADO: "CANCELADO"
});

const SERVICE_TYPE = Object.freeze({
    ASEO: "ASEO",
    RECREACION: "RECREACION",
    ALIMENTACION: "ALIMENTACION"
});

const PERMISSIONS = Object.freeze({
    GESTIONAR_ROLES_PERMISOS: "Gestionar roles y permisos",
    GESTIONAR_USUARIOS: "Gestionar usuarios",
    GESTIONAR_EMPLEADOS: "Gestionar empleados",
    GESTIONAR_SEDES: "Gestionar sedes",
    GESTIONAR_TIPOS_HABITACION: "Gestionar tipos de habitacion",
    GESTIONAR_HABITACIONES_SEDE: "Gestionar habitaciones por sede",
    GESTIONAR_HABITACIONES_FISICAS: "Gestionar habitaciones fisicas",
    GESTIONAR_CATALOGO_SERVICIOS: "Gestionar catalogo de servicios",
    GESTIONAR_MASCOTAS: "Gestionar mascotas",
    GESTIONAR_CONTACTOS_EMERGENCIA: "Gestionar contactos de emergencia",
    GESTIONAR_RESERVACIONES: "Gestionar reservaciones",
    ACTUALIZAR_ESTADO_HABITACIONES: "Actualizar estado de habitaciones",
    VER_RESERVAS_DIA: "Ver reservas del dia",
    CONSULTAR_CUENTA_RESERVACION: "Consultar cuenta de reservacion",
    HACER_CHECK_IN: "Hacer check-in de reservas",
    HACER_CHECK_OUT: "Hacer check-out de reservas",
    APLICAR_PAGOS_MOSTRADOR: "Aplicar pagos cobrados en mostrador",
    CARGAR_SERVICIOS_RESERVACION: "Cargar servicios a reservacion",
    SOLICITAR_CANCELACION_RESERVACION: "Solicitar cancelacion de reservacion",
    GESTIONAR_CANCELACIONES_RESERVACION: "Gestionar cancelaciones de reservacion",
    VER_REPORTES_ESTADO_MASCOTA: "Ver reportes de estado de mascota",
    SUBIR_REPORTES_ESTADO_MASCOTA: "Subir reportes de estado de mascota",
    SUBIR_INFORMES_SERVICIOS: "Subir informes de servicios completados",
    APLICAR_MEDICACION: "Aplicar medicacion requerida a mascotas",
    SUBIR_INFORMES_LIMPIEZA: "Subir informes de limpieza de habitaculos",
    APLICAR_ALIMENTACION: "Aplicar alimentacion a mascotas"
});

module.exports = {
    TYPE_TRANSACTION,
    TYPE_TRANSACTION_ARRAY: Object.values(TYPE_TRANSACTION),
    METHOD_TRANSACTION,
    METHOD_TRANSACTION_ARRAY: Object.values(METHOD_TRANSACTION),
    KINSHIP,
    KINSHIP_ARRAY: Object.values(KINSHIP),
    PET_SPECIES,
    PET_SPECIES_ARRAY: Object.values(PET_SPECIES),
    SEX,
    SEX_ARRAY: Object.values(SEX),
    PET_SIZE,
    PET_SIZE_ARRAY: Object.values(PET_SIZE),
    UNIT_MEASURE_WEIGHT_PET,
    UNIT_MEASURE_WEIGHT_PET_ARRAY: Object.values(UNIT_MEASURE_WEIGHT_PET),
    VACCINE_USE,
    VACCINE_USE_ARRAY: Object.values(VACCINE_USE),
    DIET_TYPE,
    DIET_TYPE_ARRAY: Object.values(DIET_TYPE),
    UNIT_MEASURE_SERVING_PET,
    UNIT_MEASURE_SERVING_PET_ARRAY: Object.values(UNIT_MEASURE_SERVING_PET),
    ROOM_STATUS,
    ROOM_STATUS_ARRAY: Object.values(ROOM_STATUS),
    BOOKING_STATUS,
    BOOKING_STATUS_ARRAY: Object.values(BOOKING_STATUS),
    PAYMENT_METHOD,
    PAYMENT_METHOD_ARRAY: Object.values(PAYMENT_METHOD),
    MOVEMENT_TYPE,
    MOVEMENT_TYPE_ARRAY: Object.values(MOVEMENT_TYPE),
    CHECK_IN_STATUS,
    CHECK_IN_STATUS_ARRAY: Object.values(CHECK_IN_STATUS),
    CANCELLATION_STATUS,
    CANCELLATION_STATUS_ARRAY: Object.values(CANCELLATION_STATUS),
    SERVICE_TYPE,
    SERVICE_TYPE_ARRAY: Object.values(SERVICE_TYPE),
    SERVICE_ORDER_STATUS,
    SERVICE_ORDER_STATUS_ARRAY: Object.values(SERVICE_ORDER_STATUS),
    PERMISSIONS,
    PERMISSIONS_ARRAY: Object.values(PERMISSIONS)
}