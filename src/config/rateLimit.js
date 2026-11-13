import { rateLimit } from 'express-rate-limit';

const MINUTE = 60 * 1000;

const formatWindow = (minutes) =>
	minutes % 60 === 0
		? `${minutes / 60} ${minutes === 60 ? 'hora' : 'horas'}`
		: `${minutes} minutos`;

// Cria um limitador por IP com resposta 429 em português.
// A contagem fica na memória do processo: zera quando a API reinicia.
const createLimiter = ({ windowMinutes, limit, message, ...options }) =>
	rateLimit({
		windowMs: windowMinutes * MINUTE,
		limit,
		// Cabeçalhos padrão RateLimit e RateLimit-Policy (+ Retry-After no 429).
		standardHeaders: 'draft-8',
		legacyHeaders: false,
		message: {
			error: `${message} Tente novamente em ${formatWindow(windowMinutes)}.`,
		},
		...options,
	});

// Login: só as tentativas que falham contam (força bruta de senha).
export const loginLimiter = createLimiter({
	windowMinutes: 15,
	limit: 10,
	skipSuccessfulRequests: true,
	message: 'Muitas tentativas de login.',
});

// Cadastro: uma pessoa cria uma conta; a folga cobre redes compartilhadas.
export const registerLimiter = createLimiter({
	windowMinutes: 60,
	limit: 5,
	message: 'Muitos cadastros feitos a partir desta rede.',
});

// Cada chamada cria um PaymentIntent no Stripe.
export const paymentIntentLimiter = createLimiter({
	windowMinutes: 15,
	limit: 30,
	message: 'Muitas tentativas de pagamento.',
});

// Limite geral das rotas da API (não inclui as imagens).
export const generalLimiter = createLimiter({
	windowMinutes: 15,
	limit: 300,
	message: 'Muitas requisições.',
});
