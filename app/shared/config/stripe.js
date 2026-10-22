const Stripe = require('stripe');
const { ApiError } = require('../utils/errors.js');

let stripeClient = null; //generar cliente stripe cuando se tenga STRIPE_SECRET_KEY

const getStripeClient = () => {
    if(!stripeClient) {
        if(!process.env.STRIPE_SECRET_KEY) {
            throw new Error("STRIPE_SECRET_KEY no esta configurada. Agrega tu llave de prueba (sk_test_...) al archivo .env correspondiente.");
        }
        stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);
    }
    return stripeClient;
}

// Token de prueba publico de Stripe para un pago con tarjeta exitoso en modo
// test: se usa cuando el front end todavia no envia un PaymentMethod real.
const DEFAULT_TEST_PAYMENT_METHOD = 'pm_card_visa';

// Busca (por email) o crea el Customer de Stripe del cliente de BarkBook. Sin
// un customer en el PaymentIntent, Stripe agrupa los cobros de la misma
// tarjeta en un "cliente invitado" con el nombre del primer pago registrado.
// customers.list por email es consistente al instante (customers.search no).
const getOrCreateStripeCustomer = async ({ id, name, email, phone }) => {
    const stripe = getStripeClient();
    const barkbookCustomerId = String(id);

    if(email) {
        const { data } = await stripe.customers.list({ email, limit: 100 });
        const existing = data.find(customer => customer.metadata?.barkbookCustomerId === barkbookCustomerId);
        if(existing) {
            if(existing.name !== name) return await stripe.customers.update(existing.id, { name });
            return existing;
        }
    }

    return await stripe.customers.create({
        name,
        email: email || undefined,
        phone: phone || undefined,
        metadata: { barkbookCustomerId }
    });
}

// Datos del Customer de Stripe a partir de un Customer de BarkBook cargado con
// su User (de donde sale el email).
const toStripeCustomer = (customer) => ({
    id: customer.id,
    name: `${customer.name} ${customer.lastname}`.trim(),
    email: customer.User?.email,
    phone: customer.phoneNumber
});

// Cobra un monto en quetzales con Stripe y devuelve el id del PaymentIntent
// (se guarda como reference del ABONO para poder reembolsarlo). customer es el
// cliente de BarkBook al que se le hace el cobro: { id, name, email, phone }.
// Lanza PAYMENT_FAILED si el cobro es rechazado o no se completa.
const chargeCard = async ({ amount, paymentMethodId, description, customer }) => {
    let paymentIntent;
    try {
        const stripeCustomer = await getOrCreateStripeCustomer(customer);
        paymentIntent = await getStripeClient().paymentIntents.create({
            amount: Math.round(amount * 100),
            currency: 'gtq',
            customer: stripeCustomer.id,
            payment_method: paymentMethodId || DEFAULT_TEST_PAYMENT_METHOD,
            payment_method_types: ['card'],
            confirm: true,
            off_session: true,
            error_on_requires_action: true,
            description
        });
    } catch(err) {
        throw new ApiError(`El pago con Stripe fue rechazado: ${err.message}`, "PAYMENT_FAILED");
    }
    if(paymentIntent.status !== 'succeeded') {
        throw new ApiError(`El pago con Stripe no se pudo completar (estado: ${paymentIntent.status}).`, "PAYMENT_FAILED");
    }
    return paymentIntent.id;
}

module.exports = { getStripeClient, chargeCard, toStripeCustomer };
