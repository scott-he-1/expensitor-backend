import { Router } from "express";
import { prisma } from "../../prisma/db.setup";
import { validateRequest } from "zod-express-middleware";
import { z } from "zod";
import {
  authMiddleware,
  createTokenForUser,
  encryptPassword,
} from "../auth.utils";

const userController = Router();

userController.get("/user/:id/expenses", authMiddleware, async (req, res) => {
  const id = parseInt(req.params.id);
  if (!id) {
    return res.status(400).json({ message: "ID should be a number" });
  }

  const user = await prisma.user.findFirst({
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

  return res.status(200).json(user.expenses.sort((a, b) => a.id - b.id));
});

userController.post(
  "/user",
  validateRequest({
    body: z.object({ email: z.string().email(), password: z.string() }),
  }),
  async (req, res) => {
    const emailExists = await prisma.user.findFirst({
      where: { email: req.body.email },
    });
    if (emailExists) {
      return res.status(401).json({ message: "Email already exists" });
    }

    const newUser = await prisma.user.create({
      data: {
        email: req.body.email,
        password: await encryptPassword(req.body.password),
      },
    });

    const userToken = createTokenForUser(newUser);
    return res.status(200).json({ user_token: userToken });
  }
);

export { userController };
