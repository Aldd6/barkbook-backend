const crypto = require('crypto');
const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { ApiError } = require('../utils/errors.js');

let s3Client = null; //generar cliente S3 cuando se tengan las llaves

const getS3Client = () => {
    if(!s3Client) {
        const { S3_BUCKET_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_BUCKET_NAME } = process.env;
        if(!S3_BUCKET_NAME || !S3_BUCKET_REGION || !S3_ACCESS_KEY_ID || !S3_SECRET_ACCESS_KEY) {
            throw new Error("Las variables S3_BUCKET_NAME, S3_BUCKET_REGION, S3_ACCESS_KEY_ID y S3_SECRET_ACCESS_KEY deben estar configuradas en el archivo .env correspondiente.");
        }
        s3Client = new S3Client({
            region: S3_BUCKET_REGION,
            credentials: {
                accessKeyId: S3_ACCESS_KEY_ID,
                secretAccessKey: S3_SECRET_ACCESS_KEY
            }
        });
    }
    return s3Client;
}

// El bucket es privado: en la base de datos se guarda solo la key del objeto y
// al responder se genera una URL firmada temporal para que el front end la muestre.
const SIGNED_URL_EXPIRES_IN = 60 * 60; // 1 hora

const EXTENSION_BY_MIMETYPE = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'application/pdf': 'pdf'
};

// Sube el archivo bajo <folder>/<uuid>.<ext> y devuelve la key generada.
const uploadFile = async ({ folder, buffer, mimetype }) => {
    const key = `${folder}/${crypto.randomUUID()}.${EXTENSION_BY_MIMETYPE[mimetype]}`;
    try {
        await getS3Client().send(new PutObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: key,
            Body: buffer,
            ContentType: mimetype
        }));
    } catch(err) {
        throw new ApiError(`No se pudo subir el archivo: ${err.message}`, "INTERNAL_ERROR");
    }
    return key;
}

// Borrar es best-effort: si falla, el registro ya apunta al archivo nuevo y el
// objeto viejo solo queda huerfano en el bucket, asi que no se interrumpe la peticion.
const deleteFile = async (key) => {
    if(!key) return;
    try {
        await getS3Client().send(new DeleteObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: key
        }));
    } catch(err) {
        console.log(`[S3]: No se pudo eliminar el archivo ${key}. ${err.message}`);
    }
}

// La firma se calcula localmente (no hace llamada de red).
const getFileUrl = async (key) => {
    if(!key) return null;
    return getSignedUrl(getS3Client(), new GetObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key
    }), { expiresIn: SIGNED_URL_EXPIRES_IN });
}

// Sube el archivo nuevo, apunta el campo del registro a su key y despues borra el
// anterior. Si falla el update en la base de datos se borra el archivo recien subido.
const replaceRecordFile = async (record, field, folder, file) => {
    const previousKey = record[field];
    const key = await uploadFile({ folder, buffer: file.buffer, mimetype: file.mimetype });
    try {
        await record.update({ [field]: key });
    } catch(err) {
        await deleteFile(key);
        throw err;
    }
    await deleteFile(previousKey);
    return record;
}

const removeRecordFile = async (record, field) => {
    const previousKey = record[field];
    if(!previousKey) return record;
    await record.update({ [field]: null });
    await deleteFile(previousKey);
    return record;
}

module.exports = { uploadFile, deleteFile, getFileUrl, replaceRecordFile, removeRecordFile };
