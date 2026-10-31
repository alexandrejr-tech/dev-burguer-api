import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import routes from './routes.js';
import fileRouteConfig from './config/fileRoutes.cjs'
import cors from 'cors'

if (!process.env.CORS_ORIGIN) {
	throw new Error(
		'Variável de ambiente CORS_ORIGIN não definida. Configure-a no arquivo .env (veja o .env.example).',
	);
}

const allowedOrigins = process.env.CORS_ORIGIN.split(',')
	.map((origin) => origin.trim().replace(/\/+$/, ''))
	.filter(Boolean);

// As imagens são exibidas pelo front, que roda em outra origem.
// O helmet envia Cross-Origin-Resource-Policy: same-origin por padrão, o que
// faria o navegador bloquear as imagens; aqui liberamos só as rotas de arquivos.
const allowCrossOriginResource = (_request, response, next) => {
	response.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
	next();
};

const app = express();

app.use(helmet())
app.use(cors({ origin: allowedOrigins }))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/product-file', allowCrossOriginResource, fileRouteConfig)
app.use('/category-file', allowCrossOriginResource, fileRouteConfig)

app.use(routes);

export default app;
