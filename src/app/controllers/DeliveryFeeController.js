import deliveryConfig from '../../config/delivery.js';

class DeliveryFeeController {
	async index(_request, response) {
		// Taxa de entrega em centavos, a mesma usada no valor do pagamento.
		return response.status(200).json({ deliveryFee: deliveryConfig.deliveryFee });
	}
}

export default new DeliveryFeeController();
