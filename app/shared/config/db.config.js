module.exports = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    dbName: process.env.DB_NAME,
    dialect: process.env.DB_DIALECT,
    ssl: process.env.DB_SSL === 'require' ? true:false,
    pool: {
        max: 1000,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
};