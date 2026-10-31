import * as Yup from 'yup';

// Itens de um pedido/pagamento: só o id e a quantidade vêm do cliente.
// O preço nunca é aceito do front; ele é sempre buscado no banco.
export const orderProductsSchema = Yup.object({
	products: Yup.array()
		.required()
		.min(1, 'Informe ao menos um produto')
		.of(
			Yup.object({
				id: Yup.number().integer().positive().required(),
				quantity: Yup.number()
					.integer('A quantidade precisa ser um número inteiro')
					.min(1, 'A quantidade precisa ser maior ou igual a 1')
					.required(),
			}),
		),
});
