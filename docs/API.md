# BarkBook API

Referencia de la API REST del back end de BarkBook (hotel de mascotas). El código
fuente en `C:\Programs\VSCode\BarkBook-BackEnd` es la fuente de verdad: si algo
de este documento no coincide con el código, manda el código (DTOs en
`app/modules/*/DTOs`, rutas en `app/modules/*/*.routes.js`).

---

## 1. Conexión

| Concepto | Valor |
|---|---|
| URL base (desarrollo) | `http://localhost:3000/api` (puerto en `PORT` del `.env` del back end) |
| Formato | JSON (`Content-Type: application/json`) |
| CORS | Orígenes en `CORS_ORIGIN` (separados por coma). Por defecto `http://localhost:5173` (Vite). |
| Credenciales | Toda petición debe enviarse con `credentials: 'include'` (fetch) o `withCredentials: true` (axios): el refresh token viaja en cookie. |
| Zona horaria | Las reglas de fecha ("hoy": entrada no pasada, ventana de check-in, fechas no futuras) usan `APP_TIMEZONE` (por defecto `America/Guatemala`), no UTC. |

---

## 2. Formato de respuestas

### Éxito
```json
{
  "success": true,
  "status": 200,
  "message": "Mascota encontrada exitosamente.",
  "pet": { "...": "..." }
}
```
El dato viene bajo una clave con el nombre del recurso: singular para un
registro (`pet`) y plural para listas (`pets`). Ver la columna **Clave** de cada
endpoint.

### Error de validación (400)
```json
{
  "success": false,
  "status": 400,
  "message": "Valor invalido, o campo faltante.",
  "details": [{ "field": "phoneNumber", "message": "El numero de telefono debe tener el formato +502 seguido de 8 digitos." }]
}
```
`details[].field` usa notación de punto para campos anidados (`pets.0.nonadmissionReason`).
Ideal para mostrar el error junto a cada campo del formulario.

### Error de negocio
```json
{ "success": false, "status": 409, "flag": "RESOURCE_CONFLICT", "message": "Ya existe un tipo de habitacion con el nombre Suite." }
```

| `flag` | HTTP | Uso típico en el front end |
|---|---|---|
| `INVALID_INPUT` | 400 | Mostrar `message` |
| `UNAUTHENTICATED` | 401 | Intentar `POST /auth/refresh`; si falla, ir al login |
| `PAYMENT_FAILED` | 402 | Pago con tarjeta rechazado |
| `UNAUTHORIZED_ACCESS` | 403 | Sin permiso o recurso de otro cliente |
| `RESOURCE_NOT_FOUND` | 404 | |
| `RESOURCE_CONFLICT` | 409 | Duplicados, estados inválidos, saldo pendiente |
| `RATE_LIMIT_EXCEEDED` | 429 | |
| `INTERNAL_ERROR` / `DATABASE_ERROR` / `REDIS_ERROR` | 500 | Error genérico |

Los mensajes vienen en español y están pensados para mostrarse al usuario.

---

## 3. Autenticación

### Flujo
1. **Registro** (solo clientes): `POST /auth/signup` → crea usuario con rol `Cliente` y `profileCompleted: false`.
2. **Login**: `POST /auth/signin` → devuelve `accessToken` en el body y deja la cookie `refreshToken` (httpOnly).
3. Enviar el access token en cada petición: `Authorization: Bearer <accessToken>`.
4. El access token dura **15 minutos**. Al recibir 401, llamar `POST /auth/refresh` (sin body; usa la cookie) → nuevo `accessToken` y rota la cookie. Reintentar la petición original.
5. **Logout**: `POST /auth/signout` → invalida el refresh token y borra la cookie.

Guardar el access token **en memoria** (estado de la app), no en `localStorage`.
Al recargar la página, llamar `POST /auth/refresh` para recuperar la sesión.

### Payload del access token (decodificable con `jwt-decode`)
```json
{
  "id": 12,
  "username": "daniel",
  "roleId": 6,
  "roleName": "Cliente",
  "profileCompleted": true,
  "name": "Daniel",
  "lastname": "Aldana"
}
```
`name`/`lastname` solo existen si el usuario ya tiene perfil de cliente o de empleado.

### Perfil de cliente obligatorio
Tras el registro, el cliente debe completar su perfil con `POST /customers`
(el back end toma el `userId` del token). Eso pone `profileCompleted: true` y
la respuesta trae un **`accessToken` nuevo** (y rota la cookie), que reemplaza
al anterior. Mientras no exista perfil, los endpoints de recursos del cliente
responden 403 "Debe completar su perfil de cliente…".

### Sesión actual: `GET /auth/me`
El token no trae `uid`, `customerId` ni el id de empleado, que son los que
piden las rutas. Llamar `GET /auth/me` después del login (y al recargar):
```json
{
  "success": true, "status": 200, "message": "Sesion obtenida exitosamente.",
  "user": { "id": 12, "uid": "1eec7ca6-...", "username": "daniel", "email": "d@x.com",
            "rolId": 6, "roleName": "Cliente", "profileCompleted": true },
  "customer": { "id": 7, "userId": 12, "name": "Daniel", "...": "..." },
  "employee": null,
  "permissions": ["Gestionar mascotas", "Gestionar reservaciones", "..."]
}
```
`customer`/`employee` son `null` si no aplica o el perfil no está completo.
`permissions` sirve para mostrar u ocultar opciones del menú (el Administrador
puede tener la lista completa y además pasa cualquier chequeo).

### Endpoints de Auth (públicos)

| Método | Ruta | Body | Respuesta |
|---|---|---|---|
| POST | `/auth/signup` | `{ username, email, password }` | `signup: { username, email }` |
| POST | `/auth/signin` | `{ username? , email?, password }` (uno de los dos) | `accessToken` |
| POST | `/auth/refresh` | — (cookie) | `accessToken` |
| POST | `/auth/signout` | — (cookie) | — |
| GET | `/auth/me` | — (requiere token) | `user`, `customer`, `employee`, `permissions` |

`username`: 3–50 caracteres, solo letras y números.

---

## 4. Roles, permisos y pertenencia

### Roles base (creados automáticamente por el seed al arrancar el servidor)

| Rol | Permisos |
|---|---|
| **Administrador** | Todos (además el back end lo deja pasar cualquier chequeo) |
| **Gerente** | Ver reservas del dia · Gestionar habitaciones fisicas · Actualizar estado de habitaciones |
| **Recepcionista** | Ver reservas del dia · Hacer check-in · Hacer check-out · Aplicar pagos cobrados en mostrador · Gestionar contactos de emergencia · Consultar cuenta de reservacion · Actualizar estado de habitaciones · Gestionar cancelaciones de reservacion |
| **Cuidador** | Subir reportes de estado de mascota · Subir informes de servicios completados · Aplicar medicacion requerida a mascotas *(funcionalidad aún no implementada)* |
| **Operador** | Subir informes de limpieza de habitaculos · Aplicar alimentacion a mascotas *(no implementadas)* · Actualizar estado de habitaciones |
| **Cliente** | Gestionar contactos de emergencia · Consultar cuenta de reservacion · Gestionar mascotas · Gestionar reservaciones · Cargar servicios a reservacion · Ver reportes de estado de mascota · Solicitar cancelacion de reservacion |

El token **no incluye los permisos**; los del usuario actual vienen en
`GET /auth/me` (`permissions`). Usarlos para mostrar u ocultar opciones de menú
en vez de decidir por `roleName`, porque el Administrador puede modificar los
permisos de cada rol.

### Reglas de pertenencia (rol `Cliente`)
- Un Cliente solo puede leer/modificar **sus propios** recursos: perfil, mascotas
  y su expediente, contactos de emergencia, reservas, check-ins/check-outs de sus
  reservas y su usuario. Sobre recursos de otro cliente recibe 403.
- Los listados globales (`GET /customers`, `/pets`, `/emergency-contacts`,
  `/pet-diets`, `/pet-sanity`, `/pet-vaccines`, `/users`) están bloqueados
  para Clientes: usar las rutas filtradas (`/pets/customer/:customerId`, etc.).
- En altas (`POST /pets`, `/bookings`, `/emergency-contacts`) el `customerId`
  del body debe ser el del propio cliente.
- El personal (cualquier otro rol) no tiene restricción de pertenencia, solo de permisos.
- Cualquier usuario puede ver/editar su propio usuario (`/users/:uid`) y un
  empleado puede ver su propio perfil (`GET /employees/:id`).

---

## 5. Endpoints

Leyenda de la columna **Acceso**:
- `—` público (sin token)
- `token` cualquier sesión válida
- `P: <permiso>` requiere ese permiso
- `propio` aplica regla de pertenencia para Clientes
- `staff` bloqueado para Clientes

Todos los `DELETE` son borrado lógico (archivado) y tienen su `PATCH /:id/restore`.

### Dirección (catálogos)
| Método | Ruta | Acceso | Clave |
|---|---|---|---|
| GET | `/address/states` | — | `states: [{ id, stateName }]` |
| GET | `/address/states/:stateId/cities` | — | `cities: [{ id, stateId, cityName }]` |

### Usuarios
| Método | Ruta | Acceso | Body | Clave |
|---|---|---|---|---|
| POST | `/users` | P: Gestionar usuarios | `{ rolId, username, email, password }` | `user` |
| GET | `/users` | P: Gestionar usuarios | | `users` |
| GET | `/users/:uid` | propio usuario o P: Gestionar usuarios | | `user` |
| PUT | `/users/:uid` | propio usuario o P: Gestionar usuarios | `{ rolId?, username?, email?, password?, profileCompleted? }` | `user` |
| DELETE | `/users/:uid` | propio usuario o P: Gestionar usuarios | | `user` |

`user`: `{ id, uid (uuid), rolId, username, email, profileCompleted }`. `id` es el que pide `PATCH /employees/:id/assign-user`.
`rolId` y `profileCompleted` solo pueden enviarse en el `PUT` con el permiso
"Gestionar usuarios" (incluso sobre la propia cuenta); sin él, 403.
Para crear personal: crear el usuario con `POST /users` y vincularlo al
empleado con `PATCH /employees/:id/assign-user`.

### Roles y permisos (solo Administrador)
| Método | Ruta | Body | Clave |
|---|---|---|---|
| POST | `/roles` | `{ name }` | `rol: { id, name }` |
| GET | `/roles` | | `roles: [{ id, name, permissions }]` |
| GET | `/roles/:id` | | `rol` |
| GET | `/roles/:id/permissions` | | `permisos: { permissions: [...] }` |
| PATCH | `/roles/permissions` | `{ id, permissionsIds: number[] }` (reemplaza la lista) | `rol` |
| DELETE / PATCH | `/roles/:id`, `/roles/:id/restore` | | `rol` |
| POST | `/permissions` | `{ permissionName, permissionType }` | `permission` |
| GET | `/permissions` | | `permissions: [{ id, permissionName, permissionType }]` |
| DELETE / PATCH | `/permissions/:permissionId`, `/permissions/:permissionId/restore` | | `permission` |

Nota: archivar un rol no borra sus permisos; al restaurarlo los recupera.

### Clientes
| Método | Ruta | Acceso | Clave |
|---|---|---|---|
| POST | `/customers` | token (crea el perfil del usuario del token) | `customer`, `accessToken` |
| GET | `/customers` | staff | `customers` |
| GET / PUT / DELETE | `/customers/:id` | propio | `customer` |
| PATCH | `/customers/:id/restore` | propio | `customer` |
| PUT / DELETE | `/customers/:id/profile-picture` | propio | `customer` |

Body de alta: `{ cityId, name, lastname, dpiNumber (13 dígitos), nitOrCf (true = factura con NIT), nitNumber? (obligatorio si nitOrCf), addressLineOne, addressLineTwo?, phoneNumber (+502XXXXXXXX), termsAcceptance (debe ser true) }`. La foto se sube aparte (ver [Archivos](#archivos-fotos-y-documentos)).
Update: los mismos campos opcionales salvo `dpiNumber` y `termsAcceptance`.

### Contactos de emergencia
| Método | Ruta | Acceso | Clave |
|---|---|---|---|
| POST | `/emergency-contacts` | P: Gestionar contactos de emergencia · propio | `emergencyContact` |
| GET | `/emergency-contacts` | staff | `emergencyContacts` |
| GET | `/emergency-contacts/customer/:customerId` | propio | `emergencyContacts` |
| GET | `/emergency-contacts/:id` | propio | `emergencyContact` |
| PUT / DELETE / restore | `/emergency-contacts/:id` | P: Gestionar contactos de emergencia · propio | `emergencyContact` |

Body: `{ customerId, name, lastname, kinship (KINSHIP), phoneNumber }` (`customerId` no editable).

### Mascotas
| Método | Ruta | Acceso | Clave |
|---|---|---|---|
| POST | `/pets` | P: Gestionar mascotas · propio | `pet` |
| GET | `/pets` | staff | `pets` |
| GET | `/pets/customer/:customerId` | propio | `pets` |
| GET | `/pets/:id` | propio | `pet` |
| PUT / DELETE / restore | `/pets/:id` | P: Gestionar mascotas · propio | `pet` |
| PUT / DELETE | `/pets/:id/profile-picture` | P: Gestionar mascotas · propio | `pet` |
| PUT / DELETE | `/pets/:id/vaccination-card` | P: Gestionar mascotas · propio | `pet` |

Body: `{ customerId, name, species (PET_SPECIES), sex (SEX), birthday (YYYY-MM-DD, no futura), size (PET_SIZE), actualWeight, unitOfMeasureWeight (UNIT_MEASURE_WEIGHT_PET), sociabilityLevel (0–5), isNeutered }`. Foto y carné de vacunación se suben aparte (ver [Archivos](#archivos-fotos-y-documentos)).

#### Expediente de la mascota
Mismo patrón para los tres recursos:

| Recurso | Base | Claves | Body de alta |
|---|---|---|---|
| Dietas | `/pet-diets` | `petDiet` / `petDiets` | `{ petId, dietType (DIET_TYPE), timesToEatAday, servings, unitOfMeasureServing (UNIT_MEASURE_SERVING_PET), observations?, activeDiet? }` |
| Enfermedades | `/pet-sanity` | `petSanity` / `petSanities` | `{ petId, illnessName, isCronic, isContagious, sufferedSince, enduredUntil? }` (respuesta incluye `isIllnessActive`; en update `enduredUntil: null` reactiva la enfermedad) |
| Vacunas | `/pet-vaccines` | `petVaccine` / `petVaccines` | `{ petId, vaccineName, vaccineUse (VACCINE_USE), dateOfPlacement }` |

| Método | Ruta | Acceso |
|---|---|---|
| POST | `/<base>` | P: Gestionar mascotas · propio |
| GET | `/<base>` | staff |
| GET | `/<base>/pet/:petId` | propio |
| GET | `/<base>/:id` | propio |
| PUT / DELETE / restore | `/<base>/:id` | P: Gestionar mascotas · propio |
| PATCH | `/pet-diets/:id/activate`, `/pet-diets/:id/deactivate` | P: Gestionar mascotas · propio |

### Sedes y habitaciones
| Método | Ruta | Acceso | Clave |
|---|---|---|---|
| GET | `/branches`, `/branches/:id` | token | `branches` / `branch` |
| POST / PUT / DELETE / restore | `/branches[/:id]` | P: Gestionar sedes | `branch` |
| GET | `/room-types`, `/room-types/:id` | token | `roomTypes` / `roomType` |
| POST / PUT / DELETE / restore | `/room-types[/:id]` | P: Gestionar tipos de habitacion | `roomType` |
| GET | `/room-branches`, `/room-branches/:id`, `/room-branches/branch/:branchId` | token | `roomBranches` / `roomBranch` |
| POST / PUT / DELETE / restore | `/room-branches[/:id]` | P: Gestionar habitaciones por sede | `roomBranch` |
| GET | `/room-inventory`, `/room-inventory/:id`, `/room-inventory/room-branch/:roomBranchId` | token | `roomInventory` |
| GET | `/room-inventory/archived[?roomBranchId=]` | P: Gestionar habitaciones fisicas | `roomInventory` (solo archivadas) |
| POST | `/room-inventory/generate` | P: Gestionar habitaciones fisicas | `roomInventory` |
| PUT | `/room-inventory/:id` | P: Actualizar estado de habitaciones | `roomInventory` |
| DELETE / restore | `/room-inventory/:id` | P: Gestionar habitaciones fisicas | `roomInventory` |

- **Sede**: `{ cityId, branchName, addressLineOne, addressLineTwo? }`.
- **Tipo de habitación**: `{ name, prefix (2–10, se guarda en mayúsculas, no editable), speciesType, isCage, lengthDimension, widthDimensions, heightDimensions, description?, hasAC, isSoundproofed, hasCCTV, hasOrthopedicBed, hasPrivateYard, hasSharedYard, hasToys, maximumNumberOfGuests, nightlyRate }`.
- **Habitaciones por sede** (`RoomBranch`): qué tipo ofrece una sede y cuántas unidades: `{ branchId, roomTypeId, maximumQuantity }`. Es lo que se reserva (`branchRoomId`). Si la sede ya tuvo ese tipo y la configuración está archivada, el `POST` la restaura con el nuevo `maximumQuantity` (200 en vez de 201); 409 si el cupo es menor que sus habitaciones vigentes.
- **Habitación física** (`RoomInventory`): `{ id, roomBranchId, roomNumber (prefijo + número, ej. STD001), status (ROOM_STATUS), active, archivedAt }`. `archivedAt` es `null` si está vigente y la fecha de archivado si no. Se generan en lote: `{ branchId, roomTypeId, quantity (1–500) }`. Update: `{ status?, active? }`.
  - **Cupo**: `maximumQuantity` cuenta solo las habitaciones no archivadas. Las archivadas no ocupan espacio.
  - **Numeración**: el consecutivo parte del número más alto ya usado en esa `RoomBranch`, incluidas las archivadas, así que nunca se reutiliza un número. El relleno de ceros sale de los dígitos de `maximumQuantity`. Si el consecutivo lo excede, el número lleva más dígitos (máximo 9 → `STD10`).
  - **Archivadas**: `GET /room-inventory/archived` las lista ordenadas de la más reciente a la más antigua. `roomBranchId` es opcional, filtra por configuración y responde 404 si no existe. `GET /room-inventory` y `/room-branch/:roomBranchId` no las incluyen.
  - **Restaurar**: 409 `RESOURCE_CONFLICT` si la configuración ya tiene `maximumQuantity` habitaciones no archivadas. Restaurar una habitación que no está archivada no hace nada y la devuelve tal cual.

### Servicios
| Método | Ruta | Acceso | Clave |
|---|---|---|---|
| GET | `/services`, `/services/:id` | token | `services` / `service` |
| POST / PUT / DELETE / restore | `/services[/:id]` | P: Gestionar catalogo de servicios | `service` |
| GET | `/service-branches`, `/service-branches/:id` | token | `serviceBranches` / `serviceBranch` |
| GET | `/service-branches/branch/:branchId` | token | `serviceBranches` (incluye `service` completo) |
| POST / DELETE / restore | `/service-branches[/:id]` | P: Gestionar catalogo de servicios | `serviceBranch` |
| GET | `/services/booking/:bookingId` | P: Cargar servicios a reservacion · propio | `services` (solo los de la sede de la reserva) |
| POST | `/services/booking/:bookingId/charge` | P: Cargar servicios a reservacion · propio | `bill`, `payment`, `balance` |

- **Servicio**: `{ name, description?, serviceType (SERVICE_TYPE), speciesType? (null = cualquier especie), isMultiGuest, rate }`.
- **Asignar a sede**: `{ branchId, serviceId }`. Reasignar uno retirado lo restaura.
#### Cargar servicios durante la estancia (lo hace el Cliente)
El **Cliente** agrega los servicios que quiera a su reserva `EN ESTANCIA`. El Recepcionista no carga servicios: solo revisa la cuenta y cobra el saldo.

1. **Catálogo**: `GET /services/booking/:bookingId` devuelve solo los servicios que se prestan en la **sede de la reserva** y que aplican a la especie de su tipo de habitación (`speciesType` igual o `null`). Usar esta ruta, no `/services`.
2. **Cargar**: `POST /services/booking/:bookingId/charge` con
   `{ serviceId, paymentMethod, petIds?, stripePaymentMethodId?, description? }`.
   - `paymentMethod` (SERVICE_PAYMENT_OPTION):
     - `TARJETA CREDITO/DEBITO`: se cobra al momento con Stripe. Se registran un `CARGO` y un `ABONO` (`payment`, con el PaymentIntent en `reference`), así que no genera saldo. En modo test, si no se envía `stripePaymentMethodId` se usa `pm_card_visa`. Si Stripe rechaza el cobro: 402 `PAYMENT_FAILED`.
     - `CARGO A CUENTA`: se registra solo el `CARGO` (`methodPayment: null`) y `payment` es `null`. Sube el saldo, que el Recepcionista cobra en mostrador.
   - Reglas: solo reservas `EN ESTANCIA`; el servicio debe prestarse en la sede de la reserva; las mascotas deben estar admitidas en el check-in. Monto = `rate × (isMultiGuest ? 1 : nº mascotas)`; sin `petIds` se cobra a todas las admitidas.
   - Respuesta: `bill` (el cargo), `payment` (el abono con tarjeta o `null`) y `balance` (saldo pendiente de la reserva).

### Reservas
| Método | Ruta | Acceso | Clave |
|---|---|---|---|
| POST | `/bookings` | P: Gestionar reservaciones · propio | `booking` |
| GET | `/bookings` | P: Ver reservas del dia | `bookings` |
| GET | `/bookings/pending` | P: Ver reservas del dia | `pendingBookings: [{ booking, expiresAt, hoursRemaining }]` |
| GET | `/bookings/auto-cancelled` | P: Ver reservas del dia | `bookings` |
| GET | `/bookings/customer/:customerId` | P: Consultar cuenta de reservacion · propio | `bookings` |
| GET | `/bookings/:id` | P: Consultar cuenta de reservacion · propio | `booking` |
| PATCH | `/bookings/:id/confirm-payment` | P: Aplicar pagos cobrados en mostrador | `booking` |

Alta: `{ branchRoomId, customerId, checkInDate, checkOutDate (YYYY-MM-DD, salida > entrada, entrada no pasada), petIds: number[], paymentMethod (PAYMENT_METHOD), stripePaymentMethodId? }`.
- Todas las mascotas deben ser de la especie del tipo de habitación y no exceder `maximumNumberOfGuests`.
- Con `TARJETA` se cobra con Stripe al momento y la reserva queda `RESERVA CONFIRMADA`. En modo test, si no se envía `stripePaymentMethodId` se usa `pm_card_visa`.
- Con otro método queda `RESERVA PENDIENTE DE CONFIRMAR` y tiene **5 días** para pagarse en mostrador; si no, se cancela automáticamente.

`booking`:
```json
{
  "id": 1, "branchRoomId": 3, "customerId": 7,
  "checkInDate": "2026-10-10", "checkOutDate": "2026-10-13",
  "bookingStatus": "RESERVA CONFIRMADA", "nightlyRate": 150, "cancellationReason": null,
  "pets": [{ "id": 1, "bookingId": 1, "petId": 4 }],
  "bill": [{ "id": 1, "bookingId": 1, "serviceId": null, "quantity": null,
             "movementType": "CARGO", "amount": 450, "methodPayment": "POS",
             "reference": null, "description": "Cargo por reserva #1 ..." }]
}
```
Toda respuesta de reserva incluye `balance`: el **saldo pendiente**, igual a la suma de `CARGO` − la suma de `ABONO`. Un `CARGO` con
`methodPayment: null` es un servicio cargado a la cuenta que todavía no se ha cobrado.

`confirm-payment`: `{ methodPayment (cualquiera menos TARJETA), reference?, description? }`.
Registra un `ABONO` por el saldo pendiente. Funciona en `PENDIENTE DE CONFIRMAR`
(pasa a `CONFIRMADA`) y en `EN ESTANCIA` (salda servicios; el estado no cambia).

### Cancelación de reservas
El **Cliente** solicita la cancelación y un **Recepcionista de la sede de la reserva** la confirma o la rechaza.

| Método | Ruta | Acceso | Clave |
|---|---|---|---|
| POST | `/booking-cancellations` | P: Solicitar cancelacion de reservacion · propio | `bookingCancellation` |
| GET | `/booking-cancellations[?status=]` | P: Gestionar cancelaciones de reservacion · sede | `bookingCancellations` (cada una con `booking`) |
| GET | `/booking-cancellations/booking/:bookingId` | P: Consultar cuenta de reservacion · propio | `bookingCancellations` (historial, la más reciente primero) |
| PATCH | `/booking-cancellations/:id/approve` | P: Gestionar cancelaciones de reservacion · sede | `bookingCancellation`, `booking` |
| PATCH | `/booking-cancellations/:id/reject` | P: Gestionar cancelaciones de reservacion · sede | `bookingCancellation` |

- **Solicitar**: `{ bookingId, reason (5–255) }`. Solo reservas `RESERVA CONFIRMADA` o `RESERVA PENDIENTE DE CONFIRMAR`, y una solicitud `PENDIENTE` a la vez por reserva (409). La reserva no cambia hasta que se resuelva.
- **Sede**: el personal solo lista y resuelve solicitudes de reservas de la sede de su perfil de empleado (`employee.branchId`); otra sede responde 403, igual que un usuario sin perfil de empleado. El Administrador ve y resuelve todas.
- **Aprobar**: `{ resolutionNotes? }`. La reserva pasa a `CANCELADA` (libera el cupo) con `cancellationReason` = "Cancelada a solicitud del cliente: …", y cada `ABONO` genera un `REEMBOLSO`: los de tarjeta se reembolsan en Stripe; los de otros métodos se registran y el dinero se devuelve en mostrador. Si la reserva ya estaba `CANCELADA` (p. ej. por vencimiento del pago) solo se cierra la solicitud; si ya está `EN ESTANCIA` o `FINALIZADA`, 409 (hay que rechazarla).
- **Rechazar**: `{ resolutionNotes (5–255, obligatorio) }`. La reserva no cambia; el cliente puede volver a solicitar.
- Mientras haya una solicitud `PENDIENTE`, `POST /check-ins` responde 409.

`bookingCancellation`: `{ id, bookingId, branchId, reason, status (CANCELLATION_STATUS), requestedByUserId, resolvedByUserId, resolutionNotes, requestedAt, resolvedAt, booking? }`.

### Check-in
| Método | Ruta | Acceso | Clave |
|---|---|---|---|
| POST | `/check-ins` | P: Hacer check-in de reservas | `checkIn` |
| GET | `/check-ins` | P: Ver reservas del dia | `checkIns` |
| GET | `/check-ins/booking/:bookingId/available-rooms` | P: Hacer check-in de reservas | `roomInventory` (habitaciones disponibles del tipo y sede de la reserva) |
| GET | `/check-ins/booking/:bookingId` | P: Consultar cuenta de reservacion · propio | `checkIn` |
| GET | `/check-ins/:id` | P: Consultar cuenta de reservacion · propio | `checkIn` |

Body: `{ bookingId, pets: [{ bookingPetId, admitted, nonadmissionReason? (obligatorio si no se admite) }], customerAcceptsPartialAdmission? (obligatorio si se admiten solo algunas), roomNumber? (obligatorio si hay admitidas), observations? }`.
- La reserva debe estar pagada (saldo 0); si no, 409 con el saldo y la fecha límite.
- Solo desde la fecha de entrada y antes de la de salida (en `APP_TIMEZONE`). 409 si hay una solicitud de cancelación pendiente.
- Si no se admite ninguna mascota (o el cliente no acepta admisión parcial), el check-in queda `CANCELADO`, la reserva `CANCELADA` y se reembolsan los pagos.
- Si es exitoso: reserva `EN ESTANCIA` y habitación `OCUPADA`.

`checkIn`: `{ id, bookingId, roomInventoryId, roomNumber, checkInDate, observations, status, pets: [{ id, checkInId, bookingPetId, petId, admitted, nonadmissionReason }] }`.

### Check-out
| Método | Ruta | Acceso | Clave |
|---|---|---|---|
| POST | `/check-outs` | P: Hacer check-out de reservas | `checkOut` |
| GET | `/check-outs` | P: Ver reservas del dia | `checkOuts` |
| GET | `/check-outs/check-in/:checkInId` | P: Consultar cuenta de reservacion · propio | `checkOut` |
| GET | `/check-outs/:id` | P: Consultar cuenta de reservacion · propio | `checkOut` |

Body: `{ checkInId, observations?, payment?: { methodPayment, reference?, description? } }`. Requiere reserva `EN ESTANCIA`.
- Si `balance` es 0, el check-out procede sin pago.
- Si hay saldo (servicios cargados a la cuenta), el Recepcionista lo cobra en el mismo paso enviando `payment`. `methodPayment` acepta cualquier método excepto `TARJETA CREDITO/DEBITO`. Se registra un `ABONO` por todo el saldo, en la misma transacción. Enviar `payment` requiere además el permiso "Aplicar pagos cobrados en mostrador".
- Si hay saldo y no se envía `payment`: 409 con el monto pendiente. Alternativa: saldar antes con `PATCH /bookings/:id/confirm-payment`.

Resultado: reserva `FINALIZADA`, habitación `LIMPIEZA Y DESINFECCION`.

Flujo sugerido para la pantalla de check-out: `GET /bookings/:id` → mostrar `bill` y `balance` → si `balance > 0`, pedir el método de pago → `POST /check-outs` con `payment`.

### Empleados
| Método | Ruta | Acceso | Clave |
|---|---|---|---|
| POST | `/employees` | P: Gestionar empleados | `employee` |
| GET | `/employees` | P: Gestionar empleados | `employees` |
| GET | `/employees/:id` | propio perfil o P: Gestionar empleados | `employee` |
| PUT / DELETE / restore | `/employees/:id` | P: Gestionar empleados | `employee` |
| PATCH | `/employees/:id/assign-user` | P: Gestionar empleados | `employee` |
| PUT / DELETE | `/employees/:id/profile-picture` | P: Gestionar empleados | `employee` |

Body: `{ branchId, cityId, name, lastname, dpiNumber, addressLineOne, addressLineTwo?, phoneNumber }`. `assign-user`: `{ userId }`.

### Archivos (fotos y documentos)
Se guardan en un bucket S3 privado. Los endpoints `PUT .../profile-picture` y `PUT .../vaccination-card` reciben
`multipart/form-data` con **un solo archivo en el campo `file`** (máx. 5 MB); `DELETE` sobre la misma ruta lo quita.
Subir un archivo reemplaza al anterior.

| Campo | Formatos |
|---|---|
| `profilePicture` (cliente, empleado, mascota) | jpeg, png, webp |
| `vaccinationCard` (mascota) | jpeg, png, webp, pdf |

El tipo se valida por el contenido real del archivo, no por la extensión. En todas las respuestas (incluido
`GET /auth/me`) `profilePicture` y `vaccinationCard` vienen como **URL firmada que expira en 1 hora** (o `null`):
úsala directo en `<img src>` y vuelve a pedir el recurso si expira; no la guardes.

```js
const fd = new FormData();
fd.append('file', input.files[0]);
await api.put(`/pets/${id}/profile-picture`, fd); // sin fijar Content-Type a mano
```

---

## 6. Flujo completo de una estancia

```
POST /bookings ──► PENDIENTE DE CONFIRMAR ──(PATCH confirm-payment)──► CONFIRMADA
      │ (tarjeta)                    └─(5 días sin pago)──► CANCELADA
      └──────────────────────────────────────────────────► CONFIRMADA
PENDIENTE / CONFIRMADA ──(Cliente: POST /booking-cancellations)──► solicitud PENDIENTE
      ──(Recepcionista de la sede: PATCH .../approve)──► CANCELADA + reembolsos
      ──(Recepcionista de la sede: PATCH .../reject)───► la reserva sigue igual
CONFIRMADA ──(POST /check-ins)──► EN ESTANCIA  (habitación OCUPADA)
EN ESTANCIA ──(Cliente: POST /services/booking/:id/charge)
                 ├─ TARJETA ────────► pagado con Stripe, el saldo no cambia
                 └─ CARGO A CUENTA ─► saldo > 0
            ──(Recepcionista: POST /check-outs { payment } si hay saldo)──► FINALIZADA (habitación LIMPIEZA Y DESINFECCION)
Habitación: LIMPIEZA ──(PUT /room-inventory/:id { status: "DISPONIBLE" })──► DISPONIBLE
```

---

## 7. Enums (valores exactos que acepta y devuelve la API)

| Enum | Valores |
|---|---|
| PET_SPECIES | `FELINO`, `CANINO` |
| SEX | `MACHO`, `HEMBRA` |
| PET_SIZE | `PEQUENIO`, `MEDIANO`, `GRANDE`, `EXTRA` |
| UNIT_MEASURE_WEIGHT_PET | `KILOGRAMOS`, `LIBRAS`, `GRAMOS` |
| VACCINE_USE | `INMUNIZACION`, `REFUERZO` |
| DIET_TYPE | `CROQUETAS/ALIMENTO SECO`, `ALIMENTO HUMEDO`, `ALIMENTO NATURAL`, `ALIMENTACION HIBRIDA` |
| UNIT_MEASURE_SERVING_PET | `TAZAS`, `CUCHARADAS`, `GRAMOS`, `MILIGRAMOS`, `LIBRAS`, `ONZAS` |
| KINSHIP | `PADRE/MADRE`, `HERMANO(A)`, `PRIMO(A)`, `ABUELO(A)`, `PAREJA`, `ESPOSO(A)`, `HIJO(A)` |
| ROOM_STATUS | `DISPONIBLE`, `OCUPADA`, `MANTENIMIENTO/REPARACION`, `LIMPIEZA Y DESINFECCION`, `INACTIVA` |
| BOOKING_STATUS | `RESERVA CONFIRMADA`, `RESERVA PENDIENTE DE CONFIRMAR`, `EN ESTANCIA`, `FINALIZADA`, `CANCELADA` |
| PAYMENT_METHOD | `TARJETA CREDITO/DEBITO`, `POS`, `EFECTIVO`, `TRANSFERENCIA` |
| SERVICE_PAYMENT_OPTION (cargo de servicios) | `TARJETA CREDITO/DEBITO`, `CARGO A CUENTA` |
| MOVEMENT_TYPE | `CARGO`, `ABONO`, `REEMBOLSO` |
| CHECK_IN_STATUS | `COMPLETADO`, `CANCELADO` |
| CANCELLATION_STATUS | `PENDIENTE`, `APROBADA`, `RECHAZADA` |
| SERVICE_TYPE | `ASEO`, `RECREACION`, `ALIMENTACION` |
| TYPE_TRANSACTION (permisos) | `WRT`, `READ`, `UPD`, `ERS` |

Formatos: fechas `YYYY-MM-DD`; teléfono `+502` + 8 dígitos; DPI 13 dígitos;
NIT `^[0-9]{1,10}-?[0-9Kk]$`; montos en quetzales (GTQ) como número.

---

## 8. Pendientes conocidos del back end que afectan al front end

1. **Cookie `sameSite: 'strict'`**: funciona en desarrollo (`localhost:5173` →
   `localhost:3000` es el mismo sitio). Si en producción front y API quedan en
   dominios distintos, habrá que ajustarla o servir ambos bajo el mismo dominio.
2. **Archivos huérfanos en S3**: el usuario IAM de prueba no tiene `s3:DeleteObject`, así
   que al reemplazar o quitar una foto el archivo viejo se queda en el bucket (la API no falla).
3. **Reportes, informes, medicación y alimentación** tienen permisos creados
   pero no tienen endpoints todavía.
4. **Recepcionista no tiene "Gestionar reservaciones" ni "Gestionar
   mascotas"**: hoy no puede crear reservas ni registrar mascotas en mostrador.
