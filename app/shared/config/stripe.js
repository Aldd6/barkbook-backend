const Stripe = require('stripe');

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

module.exports = { getStripeClient };
