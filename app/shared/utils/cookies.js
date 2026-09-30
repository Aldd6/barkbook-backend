const authConfig = require('../config/auth.js');

const REFRESH_TOKEN_COOKIE = 'refreshToken';

const setRefreshTokenCookie = (res, refreshToken) => {
    res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: authConfig.cookieMaxAge,
        path: '/'
    });
}

// las opciones de la cookie deben coincidir con las dadas en el set (excepto maxAge)
const clearRefreshTokenCookie = (res) => {
    res.clearCookie(REFRESH_TOKEN_COOKIE, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
    });
}

module.exports = { REFRESH_TOKEN_COOKIE, setRefreshTokenCookie, clearRefreshTokenCookie };
