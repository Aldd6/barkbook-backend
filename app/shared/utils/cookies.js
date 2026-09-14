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

module.exports = { REFRESH_TOKEN_COOKIE, setRefreshTokenCookie };
