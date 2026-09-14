const authService = require('./auth.service.js');
const SignInDTO = require('./DTOs/sign-in.js');
const SignUpDTO = require('./DTOs/sign-up.js');
const SignUpResponseDTO = require('./DTOs/sign-up-response.js');

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
        const signin = await authService.signin(requestDTO);
        
    }
}
