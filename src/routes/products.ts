import { Router } from "express";
import { fileUpload } from "../middleware/cloudinary_upload";

import {
  getAllProducts,
  createProduct,
  getProductsByFilter,
  getProductById,
  deleteProductImages,
  changeProductMainImg,
  editProductPhotos,
  editProduct,
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
router.get("/bestselling", getProductsByFilter);
router.get("/newProducts", getProductsByFilter);
router.get("/salesProducts", getProductsByFilter);

router.post(
  "/new-product",

  fileUpload.fields([{ name: "mainImg", maxCount: 1 }, { name: "images" }]),
  productValidationRules(),
  validateProduct,
  createProduct
);

router.patch("/editProduct/:id", editProduct);

router.patch(
  "/mainImg/:id",

  fileUpload.fields([{ name: "mainImg", maxCount: 1 }]),
  changeProductMainImg
);

router.patch(
  "/editPhotos/:id",

  fileUpload.fields([{ name: "images" }]),
  editProductPhotos
);

router.delete("/:id", deleteProductImages);

export default router;
