const multer = require('multer');
const { ApiError } = require('../utils/errors.js');

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const IMAGE_MIMETYPES = ['image/jpeg', 'image/png', 'image/webp'];
const DOCUMENT_MIMETYPES = [...IMAGE_MIMETYPES, 'application/pdf'];

// El mimetype que manda el cliente se puede falsificar, asi que el tipo real se
// determina por los primeros bytes del archivo (firma / magic number).
const detectMimetype = (buffer) => {
    if(buffer.length >= 3 && buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) return 'image/jpeg';
    if(buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]))) return 'image/png';
    if(buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') return 'image/webp';
    if(buffer.length >= 5 && buffer.toString('ascii', 0, 5) === '%PDF-') return 'application/pdf';
    return null;
}

const multerSingle = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_FILE_SIZE, files: 1 }
}).single('file');

// Recibe un unico archivo multipart/form-data en el campo "file" y deja en
// req.file.mimetype el tipo real detectado (si es uno de los permitidos).
const uploadFile = (allowedMimetypes) => (req, res, next) => {
    multerSingle(req, res, (err) => {
        if(err) {
            if(err.code === 'LIMIT_FILE_SIZE') return next(new ApiError(`El archivo no puede exceder los ${MAX_FILE_SIZE / (1024 * 1024)} MB.`, "INVALID_INPUT"));
            if(err instanceof multer.MulterError) return next(new ApiError(`Archivo invalido: envie un unico archivo en el campo "file". (${err.message})`, "INVALID_INPUT"));
            return next(err);
        }
        if(!req.file) return next(new ApiError('Debe enviar un archivo en el campo "file" (multipart/form-data).', "INVALID_INPUT"));

        const realMimetype = detectMimetype(req.file.buffer);
        if(!realMimetype || !allowedMimetypes.includes(realMimetype)) {
            const allowed = allowedMimetypes.map(type => type.split('/')[1]).join(', ');
            return next(new ApiError(`Tipo de archivo no permitido. Formatos aceptados: ${allowed}.`, "INVALID_INPUT"));
        }
        req.file.mimetype = realMimetype;
        next();
    });
}

const uploadImage = uploadFile(IMAGE_MIMETYPES);
const uploadDocument = uploadFile(DOCUMENT_MIMETYPES);

module.exports = { uploadImage, uploadDocument };
