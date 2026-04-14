import express from "express";
import { initializeTransaction, verifyTransaction } from "../controllers/paystackController.js";

const router = express.Router();

router.post("/initialize", initializeTransaction);
router.get("/verify/:reference", verifyTransaction);

export default router;
