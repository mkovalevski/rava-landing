import { Router } from "express";

import { store } from "../store.js";
import { publicUser, requireAuth } from "../tokens.js";

export const profileRouter = Router();

// All profile endpoints require a session.
profileRouter.use(requireAuth);

profileRouter.get("/", (req, res) => {
  res.json({ user: publicUser(req.user) });
});

profileRouter.patch("/", async (req, res) => {
  const updated = await store.updateProfile(req.user.id, req.body ?? {});
  if (!updated) return res.status(404).json({ error: "Профиль не найден" });
  res.json({ user: publicUser(updated) });
});
