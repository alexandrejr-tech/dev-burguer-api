import 'dotenv/config';

if (!process.env.JWT_SECRET) {
	throw new Error(
		'Variável de ambiente JWT_SECRET não definida. Configure-a no arquivo .env (veja o .env.example).',
	);
}

export default {
	secret: process.env.JWT_SECRET,
	expiresIn: process.env.JWT_EXPIRES_IN || '7d',
};
