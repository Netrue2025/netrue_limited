import express from "express";
import {
  createShopCategory,
  deleteShopCategory,
  getShopCategories,
  getShopCategoryById,
  updateShopCategory,
} from "../controllers/shopCategoryController.js";

const router = express.Router();

router.route("/").get(getShopCategories).post(createShopCategory);
router.route("/:id").get(getShopCategoryById).put(updateShopCategory).delete(deleteShopCategory);

export default router;
