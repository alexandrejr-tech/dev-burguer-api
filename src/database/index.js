import 'dotenv/config';
import { Sequelize } from 'sequelize';
import mongoose from 'mongoose';
import User from '../app/models/User.js';
import databaseConfig from '../config/database.cjs';
import Product from '../app/models/Product.js';
import Category from '../app/models/Category.js';

if (!process.env.APP_URL) {
	throw new Error(
		'Variável de ambiente APP_URL não definida. Configure-a no arquivo .env (veja o .env.example).',
	);
}

const models = [User, Product, Category];

class Database {
	constructor() {
		this.init();
		this.mongo();
	}

	init() {
		this.connection = new Sequelize(databaseConfig);
		models
			.map((model) => model.init(this.connection))
			.map(
				(model) => model.associate && model.associate(this.connection.models),
			);
	}

    mongo(){
        this.mongooseConnection = mongoose.connect(process.env.MONGO_URL)
    }
}

export default new Database();
