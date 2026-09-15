const authService = require('./auth.service.js');
const SignInDTO = require('./DTOs/sign-in.js');
const SignUpDTO = require('./DTOs/sign-up.js');
const SignUpResponseDTO = require('./DTOs/sign-up-response.js');
const { setRefreshTokenCookie, REFRESH_TOKEN_COOKIE } = require('../../shared/utils/cookies.js');

const signup = async (req, res, next) => {
    try {
        const requestDTO = SignUpDTO.parse(req.body);
        const signup = await authService.signup(requestDTO);
        const responseDTO = SignUpResponseDTO.parse({
            username: signup.username,
            email: signup.email
        });
        return res.status(201).json({
            success: true,
            status: 201,
            message: "Usuario registrado exitosamente.",
            signup: responseDTO
        });
    } catch(error) {
        next(error);
    }
};

const signin = async (req, res, next) => {
    try {
        const requestDTO = SignInDTO.parse(req.body);
        const { accessToken, refreshToken } = await authService.signin(requestDTO);
        setRefreshTokenCookie(res, refreshToken);
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Inicio de sesion exitoso.",
            accessToken
        });
    } catch(error) {
        next(error);
    }
};

const refresh = async (req, res, next) => {
    try {
        const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE];
        const tokens = await authService.refresh(refreshToken);
        setRefreshTokenCookie(res, tokens.refreshToken);
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Token renovado exitosamente.",
            accessToken: tokens.accessToken
        });
    } catch(error) {
        next(error);
    }
};

module.exports = { signup, signin, refresh };
