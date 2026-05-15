import express from "express";
import {
  createServicePayment,
  deleteServicePayment,
  getServicePaymentById,
  getServicePayments,
  updateServicePayment,
} from "../controllers/servicePaymentController.js";

const router = express.Router();

router.route("/").get(getServicePayments).post(createServicePayment);
router.route("/:id").get(getServicePaymentById).put(updateServicePayment).delete(deleteServicePayment);

export default router;
