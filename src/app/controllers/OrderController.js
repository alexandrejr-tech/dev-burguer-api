import mongoose from 'mongoose';
import * as Yup from 'yup';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import Order from '../schemas/Order.js';
import { orderProductsSchema } from '../validators/orderProducts.js';

const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i;

// Status aceitos para um pedido (os mesmos do painel admin do front).
const ORDER_STATUSES = [
	'Pedido Realizado',
	'Em Preparação',
	'Pedido Pronto',
	'Pedido à Caminho',
	'Entregue',
];

class OrderController {
	async store(request, response) {
		try {
			orderProductsSchema.validateSync(request.body, {
				abortEarly: false,
				strict: true,
			});
		} catch (err) {
			return response.status(400).json({ error: err.errors });
		}

		const { userId, userName } = request;
		const { products } = request.body;

		const productsIds = products.map((product) => product.id);

		const findedProducts = await Product.findAll({
			where: {
				id: productsIds,
			},
			include: {
				model: Category,
				as: 'category',
				attributes: ['name'],
			},
		});

		const mapedProducts = findedProducts.map((product) => {
			const quantity = products.find((p) => p.id === product.id).quantity;

			const newProduct = {
				id: product.id,
				name: product.name,
				price: product.price,
				url: product.url,
				category: product.category.name,
				quantity,
			};

			return newProduct;
		});

		const order = {
			user: {
				id: userId,
				name: userName,
			},
			products: mapedProducts,
			status: 'Pedido Realizado',
		};

		const newOrder = await Order.create(order);

		return response.status(201).json(newOrder);
	}

	async update(request, response) {
		const schema = Yup.object({
			status: Yup.string()
				.oneOf(ORDER_STATUSES, 'Status de pedido inválido')
				.required(),
		});

		try {
			schema.validateSync(request.body, { abortEarly: false, strict: true });
		} catch (err) {
			return response.status(400).json({ error: err.errors });
		}

		const { status } = request.body;
		const { id } = request.params;

		// O id precisa ser um ObjectId do Mongo (24 caracteres hexadecimais).
		if (typeof id !== 'string' || !OBJECT_ID_PATTERN.test(id)) {
			return response.status(400).json({ error: 'Pedido inválido' });
		}

		// A consulta usa valores criados pela própria API, e não o texto recebido:
		// um ObjectId gerado a partir do id validado e o status da lista acima.
		const orderId = mongoose.Types.ObjectId.createFromHexString(id);
		const newStatus = ORDER_STATUSES.find((item) => item === status);

		try {
			await Order.updateOne({ _id: orderId }, { status: newStatus });
		} catch (err) {
			return response.status(400).json({ error: err.message });
		}

		return response.status(200).json({ message: 'Status updated sucessfully' });
	}

	async index(_request, response) {
		const orders = await Order.find();

		return response.status(200).json(orders);
	}
}

export default new OrderController();
