import 'dotenv/config';

const rawDeliveryFee = process.env.DELIVERY_FEE;
const deliveryFee = Number(rawDeliveryFee);

if (!rawDeliveryFee || !Number.isInteger(deliveryFee) || deliveryFee < 0) {
	throw new Error(
		'Variável de ambiente DELIVERY_FEE não definida ou inválida. Informe a taxa de entrega em centavos, como número inteiro (ex.: 500 para R$ 5,00). Veja o .env.example.',
	);
}

export default {
	// Taxa de entrega em centavos.
	deliveryFee,
};
