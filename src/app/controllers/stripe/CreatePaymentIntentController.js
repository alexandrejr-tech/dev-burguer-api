import 'dotenv/config';
import Stripe from 'stripe'
import Product from '../../models/Product.js';
import deliveryConfig from '../../../config/delivery.js';
import { orderProductsSchema } from '../../validators/orderProducts.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

class CreatePaymentIntentController {
    async store(request, response) {
        try {
            orderProductsSchema.validateSync(request.body, { abortEarly: false, strict: true });
        } catch (err) {
            return response.status(400).json({ error: err.errors });
        }

        // Qualquer "price" enviado pelo cliente é ignorado.
        const { products } = request.body

        const uniqueIds = [...new Set(products.map((product) => product.id))]

        const foundProducts = await Product.findAll({
            where: { id: uniqueIds },
            attributes: ['id', 'price'],
        })

        const priceById = new Map(foundProducts.map((product) => [product.id, product.price]))

        const missingIds = uniqueIds.filter((id) => !priceById.has(id))

        if (missingIds.length > 0) {
            return response.status(400).json({
                error: 'Produto(s) não encontrado(s)',
                missingIds,
            })
        }

        // Valores em centavos, como o Stripe espera para BRL.
        const itemsTotal = products.reduce(
            (acc, product) => acc + priceById.get(product.id) * product.quantity,
            0,
        )
        const { deliveryFee } = deliveryConfig
        const amount = itemsTotal + deliveryFee

        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: "brl",
            automatic_payment_methods: {
                enabled: true,
            }
        });

        return response.json({
            clientSecret: paymentIntent.client_secret,
            dpmCheckerLink: `https://dashboard.stripe.com/settings/payment_methods/review?transaction_id=${paymentIntent.id}`,
            itemsTotal,
            deliveryFee,
            amount,
        })
    }
}

export default new CreatePaymentIntentController();
