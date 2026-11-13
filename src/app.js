import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import multer from 'multer';
import fileRouteConfig from './config/fileRoutes.cjs';
import multerConfig from './config/multer.cjs';
import { generalLimiter } from './config/rateLimit.js';
import routes from './routes.js';

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

// Quantos proxies reversos ficam entre o visitante e a API (Traefik = 1).
// Com o número exato, req.ip é o IP real do visitante e não pode ser forjado
// pelo cabeçalho X-Forwarded-For. Nunca use "true" aqui.
const trustProxyHops = Number(process.env.TRUST_PROXY_HOPS ?? 1);

if (!Number.isInteger(trustProxyHops) || trustProxyHops < 0) {
	throw new Error(
		'Variável de ambiente TRUST_PROXY_HOPS inválida. Informe um número inteiro (ex.: 1 atrás do Traefik). Veja o .env.example.',
	);
}

// Converte erros do upload (tamanho, tipo, quantidade) em 400 com mensagem clara.
const uploadErrorHandler = (error, _request, response, next) => {
	if (!(error instanceof multer.MulterError)) {
		return next(error);
	}

	const messages = {
		LIMIT_FILE_SIZE: `A imagem deve ter no máximo ${multerConfig.MAX_FILE_SIZE_MB} MB.`,
		LIMIT_FILE_COUNT: 'Envie apenas uma imagem.',
	};

	return response.status(400).json({
		error: messages[error.code] ?? error.message,
	});
};

const app = express();

app.set('trust proxy', trustProxyHops);

app.use(helmet());
// O CORS vem antes dos limitadores, para que a resposta 429 também tenha
// Access-Control-Allow-Origin e o front consiga ler a mensagem.
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// As imagens ficam fora do limite geral: só abrir o cardápio carrega dezenas delas.
app.use('/product-file', allowCrossOriginResource, fileRouteConfig);
app.use('/category-file', allowCrossOriginResource, fileRouteConfig);

app.use(generalLimiter);
app.use(routes);

app.use(uploadErrorHandler);

export default app;
