import { Router } from "express";
import { prisma } from "../../prisma/db.setup";
import "express-async-errors";
import { validateRequest } from "zod-express-middleware";
import { z } from "zod";
import bcrypt from "bcrypt";
import { createTokenForUser } from "../auth.utils";

const authController = Router();

authController.post(
  "/auth/login",
  validateRequest({
    body: z.object({ email: z.string(), password: z.string() }),
  }),
  async (req, res) => {
    const user = await prisma.user.findFirst({
      where: { email: req.body.email },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const isPasswordCorrect = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid password" }).send();
    }

    const token = createTokenForUser(user);
    return res.status(200).json({ user_token: token });
  }
);

export { authController };
