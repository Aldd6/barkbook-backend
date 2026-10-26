const crypto = require('crypto');
const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { ApiError } = require('../utils/errors.js');

let s3Client = null;

const getS3Client = () => {
    if(!s3Client) {
        const { S3_BUCKET_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_BUCKET_NAME } = process.env;
        if(!S3_BUCKET_NAME || !S3_BUCKET_REGION) {
            throw new Error("Error en la conexion con el almacenamiento de objetos.");
        }
        if(!!S3_ACCESS_KEY_ID !== !!S3_SECRET_ACCESS_KEY) {
            throw new Error("S3_ACCESS_KEY_ID y S3_SECRET_ACCESS_KEY deben configurarse juntas, o dejarse ambas vacias para usar el rol IAM de la instancia.");
        }
        const config = { region: S3_BUCKET_REGION };
        if(S3_ACCESS_KEY_ID && S3_SECRET_ACCESS_KEY) {
            config.credentials = {
                accessKeyId: S3_ACCESS_KEY_ID,
                secretAccessKey: S3_SECRET_ACCESS_KEY
            };
        }
        s3Client = new S3Client(config);
    }
    return s3Client;
}

const SIGNED_URL_EXPIRES_IN = 60 * 60;

const EXTENSION_BY_MIMETYPE = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'application/pdf': 'pdf'
};

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

const getFileUrl = async (key) => {
    if(!key) return null;
    return getSignedUrl(getS3Client(), new GetObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key
    }), { expiresIn: SIGNED_URL_EXPIRES_IN });
}

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
