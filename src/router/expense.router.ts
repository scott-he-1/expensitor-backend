import { Router } from "express";
import { prisma } from "../../prisma/db.setup";
import { authMiddleware } from "../auth.utils";
import { z } from "zod";
import { validateRequest } from "zod-express-middleware";

const expenseController = Router();

expenseController.get("/expense/:id", authMiddleware, async (req, res) => {
  const expenseId = parseInt(req.params.id);
  if (!expenseId) {
    return res.status(401).json({ message: "ID must be a number" });
  }
  const expense = await prisma.expense.findFirst({
    where: {
      id: expenseId,
    },
  });

  if (!expense) {
    return res.status(404).json({ message: "Expense not found" });
  }

  return res.status(200).json(expense);
});

expenseController.post(
  "/expense",
  authMiddleware,
  validateRequest({
    body: z.object({
      description: z.string().max(80),
      amount: z.number(),
      datePurchased: z.string(),
    }),
  }),
  async (req, res) => {
    const newExpense = await prisma.expense.create({
      data: {
        description: req.body.description,
        amount: req.body.amount,
        userId: req.user!.id,
        datePurchased: req.body.datePurchased,
      },
    });
    if (!newExpense) {
      return res.status(400).json({ message: "Something went wrong" });
    }
    return res.status(200).json(newExpense);
  }
);

expenseController.delete("/expense/:id", authMiddleware, async (req, res) => {
  const expenseId = parseInt(req.params.id);
  if (!expenseId) {
    return res.status(401).json({ message: "ID must be a number" });
  }
  const expense = await prisma.expense.findFirst({
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
  if (expense.user.id !== req.user!.id) {
    return res
      .status(400)
      .json({ message: "User not authorized to delete expense" });
  }
  const deleted = await prisma.expense.delete({
    where: {
      id: expenseId,
    },
  });
  if (!deleted) {
    return res.status(400).json({ message: "Something went wrong" });
  }
  return res.status(200).json(deleted);
});

expenseController.patch(
  "/expense/:id",
  authMiddleware,
  validateRequest({
    body: z.object({
      description: z.string(),
      amount: z.number(),
      datePurchased: z.string(),
    }),
  }),
  async (req, res) => {
    const expenseId = parseInt(req.params.id);
    if (!expenseId) {
      return res.status(401).json({ message: "ID must be a number" });
    }
    const expense = await prisma.expense.findFirst({
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
    if (expense.user.id !== req.user!.id) {
      return res
        .status(400)
        .json({ message: "User not authorized to update expense" });
    }
    const changed = await prisma.expense.update({
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
  }
);

export { expenseController };
