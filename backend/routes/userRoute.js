import { Router } from "express";
import {
  addTOHistory,
  getToUserHistory,
  login,
  register,
} from "../controllers/userControllers.js";
const router = Router();

router.route("/login").post(login);
router.route("/register").post(register);
router.route("/add_to_history").post(addTOHistory);
router.route("/get_to_history").get(getToUserHistory);

export default router;
