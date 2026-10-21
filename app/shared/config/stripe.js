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

// Cobra un monto en quetzales con Stripe y devuelve el id del PaymentIntent
// (se guarda como reference del ABONO para poder reembolsarlo). Lanza
// PAYMENT_FAILED si el cobro es rechazado o no se completa.
const chargeCard = async ({ amount, paymentMethodId, description }) => {
    let paymentIntent;
    try {
        paymentIntent = await getStripeClient().paymentIntents.create({
            amount: Math.round(amount * 100),
            currency: 'gtq',
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

module.exports = { getStripeClient, chargeCard };
