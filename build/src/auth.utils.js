"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = exports.getDataFromAuthToken = exports.createTokenForUser = exports.getNonsensitiveDataFromUser = exports.encryptPassword = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const db_setup_1 = require("../prisma/db.setup");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const encryptPassword = (password) => {
    return bcrypt_1.default.hash(password, 11);
};
exports.encryptPassword = encryptPassword;
const getNonsensitiveDataFromUser = (user) => ({
    email: user.email,
    id: user.id,
});
exports.getNonsensitiveDataFromUser = getNonsensitiveDataFromUser;
const createTokenForUser = (user) => {
    return jsonwebtoken_1.default.sign((0, exports.getNonsensitiveDataFromUser)(user), process.env.JWT_SECRET);
};
exports.createTokenForUser = createTokenForUser;
const jwtInfoSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    iat: zod_1.z.number(),
});
const getDataFromAuthToken = (token) => {
    if (!token) {
        return null;
    }
    try {
        return jwtInfoSchema.parse(jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET));
    }
    catch (e) {
        console.error(e);
        return null;
    }
};
exports.getDataFromAuthToken = getDataFromAuthToken;
const authMiddleware = async (req, res, next) => {
    const [, token] = req.headers.authorization?.split("") || [];
    const jwtData = (0, exports.getDataFromAuthToken)(token);
    if (!jwtData) {
        return res.status(401).json({ message: "Invalid token" });
    }
    const userFromJwt = await db_setup_1.prisma.user.findFirst({
        where: {
            email: jwtData.email,
        },
    });
    if (!userFromJwt) {
        return res.status(404).json({ message: "User not found" });
    }
    req.user = userFromJwt;
    next();
};
exports.authMiddleware = authMiddleware;
