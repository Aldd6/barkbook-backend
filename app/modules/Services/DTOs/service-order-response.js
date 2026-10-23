const z = require('zod');
const { SERVICE_ORDER_STATUS_ARRAY } = require('../../../shared/constants/enums.js');
const ServiceResponseDTO = require('./service-response.js');

const ServiceOrderResponseDTO = z.object({
    id: z.number(),
    bookingId: z.number(),
    branchId: z.number().nullable().optional(),
    serviceId: z.number(),
    service: ServiceResponseDTO.nullable().optional(),
    status: z.enum(SERVICE_ORDER_STATUS_ARRAY),
    amount: z.coerce.number(),
    description: z.string().nullable(),
    pets: z.array(z.object({
        id: z.number(),
        name: z.string()
    })),
    requestedByUserId: z.number(),
    resolvedByUserId: z.number().nullable(),
    resolutionNotes: z.string().nullable(),
    requestedAt: z.date(),
    resolvedAt: z.date().nullable(),
    bookingBillId: z.number().nullable()
});

module.exports = ServiceOrderResponseDTO;
