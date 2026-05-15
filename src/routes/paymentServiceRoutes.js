import express from "express";
import {
  createPaymentService,
  deletePaymentService,
  getPaymentServiceById,
  getPaymentServices,
  updatePaymentService,
} from "../controllers/paymentServiceController.js";

const router = express.Router();

router.route("/").get(getPaymentServices).post(createPaymentService);
router.route("/:id").get(getPaymentServiceById).put(updatePaymentService).delete(deletePaymentService);

export default router;
