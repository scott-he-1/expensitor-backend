"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require("express-async-errors");
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_router_1 = require("./router/auth.router");
const expense_router_1 = require("./router/expense.router");
const user_router_1 = require("./router/user.router");
dotenv_1.default.config();
["DATABASE_URL", "JWT_SECRET", "PORT"].forEach((key) => {
    if (!process.env[key]) {
        throw new Error(`Missing environment variable ${key}`);
    }
});
const port = process.env["PORT"];
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get("/", (req, res) => {
    return res.send("Hello world!");
});
app.use(auth_router_1.authController);
app.use(expense_router_1.expenseController);
app.use(user_router_1.userController);
app.listen(port, () => console.log(`Server is running on port ${port}`));
