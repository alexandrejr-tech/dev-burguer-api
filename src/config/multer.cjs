const multer  = require('multer');
const { resolve } = require('node:path');
const { v4 } = require('uuid');

const MAX_FILE_SIZE_MB = 5;

// Só imagens raster. SVG fica de fora porque pode conter JavaScript.
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

module.exports = {
	storage: multer.diskStorage({
		destination: resolve(__dirname, '..', '..', 'uploads'),
		filename: (_request, file, callback) => {
            const uniqueName = v4().concat(`-${file.originalname}`)
            return callback(null, uniqueName)
        },
	}),
	limits: {
		fileSize: MAX_FILE_SIZE_MB * 1024 * 1024,
		files: 1,
	},
	fileFilter: (_request, file, callback) => {
		if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
			const error = new multer.MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname);
			error.message = 'Formato de imagem não permitido. Envie JPG, PNG ou WebP.';
			return callback(error);
		}

		return callback(null, true);
	},
	MAX_FILE_SIZE_MB,
};
