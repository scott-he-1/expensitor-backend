"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const express_1 = require("express");
const db_setup_1 = require("../../prisma/db.setup");
require("express-async-errors");
const zod_express_middleware_1 = require("zod-express-middleware");
const zod_1 = require("zod");
const bcrypt_1 = __importDefault(require("bcrypt"));
const auth_utils_1 = require("../auth.utils");
const authController = (0, express_1.Router)();
exports.authController = authController;
authController.post("/auth/login", (0, zod_express_middleware_1.validateRequest)({
    body: zod_1.z.object({ email: zod_1.z.string(), password: zod_1.z.string() }),
}), async (req, res) => {
    const user = await db_setup_1.prisma.user.findFirst({
        where: { email: req.body.email },
    });
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    const isPasswordCorrect = await bcrypt_1.default.compare(req.body.password, user.password);
    if (!isPasswordCorrect) {
        return res.status(401).json({ message: "Invalid password" }).send();
    }
    const token = (0, auth_utils_1.createTokenForUser)(user);
    return res.status(200).json({ user_token: token });
});
