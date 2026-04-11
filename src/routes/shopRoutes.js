import { Router } from "express";

import {
  createShopItem,
  deleteShopItem,
  getShopItemById,
  getShopItems,
  updateShopItem,
} from "../controllers/shopController.js";

const router = Router();

router.route("/").get(getShopItems).post(createShopItem);
router.route("/:id").get(getShopItemById).put(updateShopItem).delete(deleteShopItem);

export default router;
