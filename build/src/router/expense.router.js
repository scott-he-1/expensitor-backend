"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expenseController = void 0;
const express_1 = require("express");
const db_setup_1 = require("../../prisma/db.setup");
const auth_utils_1 = require("../auth.utils");
const zod_1 = require("zod");
const zod_express_middleware_1 = require("zod-express-middleware");
const expenseController = (0, express_1.Router)();
exports.expenseController = expenseController;
expenseController.get("/expense/:id", auth_utils_1.authMiddleware, async (req, res) => {
    const expenseId = parseInt(req.params.id);
    if (!expenseId) {
        return res.status(401).json({ message: "ID must be a number" });
    }
    const expense = await db_setup_1.prisma.expense.findFirst({
        where: {
            id: expenseId,
        },
    });
    if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
    }
    return res.status(200).json(expense);
});
expenseController.post("/expense", auth_utils_1.authMiddleware, (0, zod_express_middleware_1.validateRequest)({
    body: zod_1.z.object({
        description: zod_1.z.string(),
        amount: zod_1.z.number(),
        datePurchased: zod_1.z.string(),
    }),
}), async (req, res) => {
    const newExpense = await db_setup_1.prisma.expense.create({
        data: {
            description: req.body.description,
            amount: req.body.amount,
            userId: req.user.id,
            datePurchased: req.body.datePurchased,
        },
    });
    if (!newExpense) {
        return res.status(400).json({ message: "Something went wrong" });
    }
    return res.status(200).json(newExpense);
});
expenseController.delete("/expense/:id", auth_utils_1.authMiddleware, async (req, res) => {
    const expenseId = parseInt(req.params.id);
    if (!expenseId) {
        return res.status(401).json({ message: "ID must be a number" });
    }
    const expense = await db_setup_1.prisma.expense.findFirst({
        where: {
            id: expenseId,
        },
        include: {
            user: true,
        },
    });
    if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
    }
    if (expense.user.id !== req.user.id) {
        return res
            .status(400)
            .json({ message: "User not authorized to delete expense" });
    }
    const deleted = await db_setup_1.prisma.expense.delete({
        where: {
            id: expenseId,
        },
    });
    if (!deleted) {
        return res.status(400).json({ message: "Something went wrong" });
    }
    return res.status(200).json(deleted);
});
expenseController.put("/expense/:id", auth_utils_1.authMiddleware, (0, zod_express_middleware_1.validateRequest)({
    body: zod_1.z.object({
        description: zod_1.z.string(),
        amount: zod_1.z.number(),
        datePurchased: zod_1.z.string(),
    }),
}), async (req, res) => {
    const expenseId = parseInt(req.params.id);
    if (!expenseId) {
        return res.status(401).json({ message: "ID must be a number" });
    }
    const expense = await db_setup_1.prisma.expense.findFirst({
        where: {
            id: expenseId,
        },
        include: {
            user: true,
        },
    });
    if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
    }
    if (expense.user.id !== req.user.id) {
        return res
            .status(400)
            .json({ message: "User not authorized to update expense" });
    }
    const changed = await db_setup_1.prisma.expense.update({
        where: { id: expenseId },
        data: {
            description: req.body.description,
            amount: req.body.amount,
            datePurchased: req.body.datePurchased,
        },
    });
    if (!changed) {
        return res.status(400).json({ message: "Something went wrong" });
    }
    return res.status(200).json(changed);
});
