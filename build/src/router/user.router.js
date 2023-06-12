"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = void 0;
const express_1 = require("express");
const db_setup_1 = require("../../prisma/db.setup");
const zod_express_middleware_1 = require("zod-express-middleware");
const zod_1 = require("zod");
const auth_utils_1 = require("../auth.utils");
const userController = (0, express_1.Router)();
exports.userController = userController;
userController.get("/user/:id/expenses", async (req, res) => {
    const id = parseInt(req.params.id);
    if (!id) {
        return res.status(400).json({ message: "ID should be a number" });
    }
    const user = await db_setup_1.prisma.user.findFirst({
        where: {
            id,
        },
        include: {
            expenses: true,
        },
    });
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(user.expenses);
});
userController.post("/user", (0, zod_express_middleware_1.validateRequest)({
    body: zod_1.z.object({ email: zod_1.z.string().email(), password: zod_1.z.string() }),
}), async (req, res) => {
    const emailExists = await db_setup_1.prisma.user.findFirst({
        where: { email: req.body.email },
    });
    if (emailExists) {
        return res.status(401).json({ message: "Email already exists" });
    }
    const newUser = await db_setup_1.prisma.user.create({
        data: {
            email: req.body.email,
            password: await (0, auth_utils_1.encryptPassword)(req.body.password),
        },
    });
    const userToken = (0, auth_utils_1.createTokenForUser)(newUser);
    return res.status(200).json({ user_token: userToken });
});
