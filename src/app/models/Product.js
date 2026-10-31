import { Model, Sequelize } from 'sequelize';

class Product extends Model {
	static init(sequelize) {
		super.init(
			{
				name: Sequelize.STRING,
				price: Sequelize.INTEGER,				
				path: Sequelize.STRING,
				offer: Sequelize.BOOLEAN,
				url: {
					type: Sequelize.VIRTUAL,
					get() {
						return `${process.env.APP_URL}/product-file/${this.path}`;
					},
				},
			},
			{
				sequelize,
				tableName: 'products',
			},
		);

		return this;
	}

	static associate (models) {
		this.belongsTo(models.Category, {
			foreignKey: 'category_id',
			as: 'category',
		})
	}
}

export default Product;
