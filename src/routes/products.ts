import { Router } from "express";
import { fileUpload } from "../middleware/cloudinary_upload";

import {
  getAllProducts,
  createProduct,
  getProductsByFilter,
  getProductById,
} from "../controllers/products-controller";

import {
  productValidationRules,
  validateProduct,
} from "../middleware/checkProduct";

const router = Router();
router.get("/", getProductsByFilter);

router.get("/all", getAllProducts);

router.get("/search", getProductsByFilter);
router.get("/product/:id", getProductById);

router.post(
  "/new-product",
  fileUpload.fields([
    { name: "mainImg", maxCount: 1 },
    { name: "images", maxCount: 4 },
  ]),
  productValidationRules(),
  validateProduct,
  createProduct
);

export default router;
