"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cloudinary_upload_1 = require("../middleware/cloudinary_upload");
const products_controller_1 = require("../controllers/products-controller");
const checkProduct_1 = require("../middleware/checkProduct");
const router = (0, express_1.Router)();
router.get("/", products_controller_1.getProductsByFilter);
router.get("/all", products_controller_1.getAllProducts);
router.get("/search", products_controller_1.getProductsByFilter);
router.get("/product/:id", products_controller_1.getProductById);
router.get("/bestselling", products_controller_1.getProductsByFilter);
router.get("/newProducts", products_controller_1.getProductsByFilter);
router.get("/salesProducts", products_controller_1.getProductsByFilter);
router.post("/new-product", cloudinary_upload_1.fileUpload.fields([{ name: "mainImg", maxCount: 1 }, { name: "images" }]), (0, checkProduct_1.productValidationRules)(), checkProduct_1.validateProduct, products_controller_1.createProduct);
router.patch("/editProduct/:id", products_controller_1.editProduct);
router.patch("/mainImg/:id", cloudinary_upload_1.fileUpload.fields([{ name: "mainImg", maxCount: 1 }]), products_controller_1.changeProductMainImg);
router.patch("/editPhotos/:id", cloudinary_upload_1.fileUpload.fields([{ name: "images" }]), products_controller_1.editProductPhotos);
router.delete("/:id", products_controller_1.deleteProductImages);
exports.default = router;
//# sourceMappingURL=products.js.map