"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeProductMainImg = exports.deleteProductImages = exports.editProductPhotos = exports.editProduct = exports.getProductById = exports.getProductsByFilter = exports.increaseQuantity = exports.createProduct = exports.getAllProducts = void 0;
const http_error_1 = require("../models/http-error");
const product_1 = require("../models/product");
const cloudinary_1 = require("cloudinary");
const getAllProducts = async (req, res, next) => {
    let products;
    let page;
    if (req.query.page) {
        page = parseInt(req.query.page);
    }
    else {
        page = 1;
    }
    const limit = 20;
    const skip = (page - 1) * limit;
    try {
        products = await product_1.Product.find({}).skip(skip).limit(limit);
    }
    catch (err) {
        return next(new http_error_1.HttpError("Can't get products", 500));
    }
    res.status(201).json({
        products: products.map((product) => product.toObject({ getters: true })),
    });
};
exports.getAllProducts = getAllProducts;
const createProduct = async (req, res, next) => {
    const { name, description, price, category, quantity, subCategory } = req.body;
    const files = req.files;
    const mainImg = {
        photoId: files["mainImg"][0].filename,
        path: files["mainImg"][0].path,
    };
    const images = files["images"].map((file) => {
        return { photoId: file.filename, path: file.path };
    });
    const product = new product_1.Product({
        name,
        description,
        price: parseFloat(price),
        category,
        mainImg,
        images,
        quantity: parseFloat(quantity),
        subCategory: JSON.parse(subCategory),
    });
    try {
        await product.save();
    }
    catch (err) {
        return next(new http_error_1.HttpError("Could not create a new product", 500));
    }
    res.status(201).json({
        product: product.toObject({ getters: true }),
    });
};
exports.createProduct = createProduct;
const increaseQuantity = async (req, res, next) => {
    const pid = req.params.productId;
    const { value } = req.body;
    let product;
    try {
        product = await product_1.Product.findById({ pid });
    }
    catch (err) {
        return next(new http_error_1.HttpError("Error by getting product", 500));
    }
    if (!product) {
        return next(new http_error_1.HttpError("There is no such product", 422));
    }
    product.quantity = product.quantity + value;
    try {
        await product.save();
    }
    catch (err) {
        return next(new http_error_1.HttpError("Server error", 500));
    }
    res.status(201).json({ message: "Increase quantity successfully!" });
};
exports.increaseQuantity = increaseQuantity;
const getProductsByFilter = async (req, res, next) => {
    let { search, category, subCategory } = req.query;
    if (!search) {
        search = "";
    }
    if (!category) {
        category = "";
    }
    if (!subCategory) {
        subCategory = "";
    }
    let subQuery;
    if (typeof subCategory === "string" && subCategory.length !== 0) {
        subQuery = subCategory.split(" ");
    }
    let products;
    try {
        if ((subCategory === null || subCategory === void 0 ? void 0 : subCategory.length) !== 0) {
            products = await product_1.Product.find({
                $or: [
                    { name: { $regex: search, $options: "i" } },
                    { description: { $regex: search, $options: "i" } },
                ],
                $and: [
                    { category: { $regex: category, $options: "i" } },
                    { subCategory: { $all: subQuery } },
                ],
            });
        }
        else {
            products = await product_1.Product.find({
                $or: [
                    { name: { $regex: search, $options: "i" } },
                    { description: { $regex: search, $options: "i" } },
                ],
                $and: [{ category: { $regex: category, $options: "i" } }],
            });
        }
    }
    catch (err) {
        return next(new http_error_1.HttpError("Server error", 500));
    }
    return res.json({
        products: products.map((product) => product.toObject({ getters: true })),
    });
};
exports.getProductsByFilter = getProductsByFilter;
const getProductById = async (req, res, next) => {
    const { id } = req.params;
    let product;
    try {
        product = await product_1.Product.findById(id);
    }
    catch (err) {
        return next(new http_error_1.HttpError("Server error", 500));
    }
    return res
        .status(201)
        .json({ product: product === null || product === void 0 ? void 0 : product.toObject({ getters: true }) });
};
exports.getProductById = getProductById;
const editProduct = async (req, res, next) => {
    const { id } = req.params;
    const { name, description, price, category, quantity, subCategory } = req.body;
    let product;
    try {
        product = await product_1.Product.findById(id);
    }
    catch (err) {
        return next(new http_error_1.HttpError("Server error", 500));
    }
    if (!product) {
        return res.status(201).json({ message: "There is no such product" });
    }
    try {
        product.name = name;
        product.description = description;
        product.price = price;
        product.category = category;
        product.quantity = quantity;
        product.subCategory = subCategory;
        await product.save();
    }
    catch (err) {
        return next(new http_error_1.HttpError("Some error happened, Please try again", 500));
    }
    return res.status(201).json({
        product: product.toObject({ getters: true }),
    });
};
exports.editProduct = editProduct;
const editProductPhotos = async (req, res, next) => {
    const { id } = req.params;
    let product;
    try {
        product = await product_1.Product.findById(id);
    }
    catch (err) {
        return next(new http_error_1.HttpError("Server error", 500));
    }
    const files = req.files;
    const images = files["images"].map((file) => {
        return { photoId: file.filename, path: file.path };
    });
    if (!product) {
        return res.status(201).json({ message: "There is no such product" });
    }
    product.images.push(...images);
    try {
        product.save();
    }
    catch (err) {
        return next(new http_error_1.HttpError("Some error happened, Please try again", 500));
    }
    return res.status(201).json({ message: "Edit successfully" });
};
exports.editProductPhotos = editProductPhotos;
const deleteProductImages = async (req, res, next) => {
    const { id } = req.params;
    const { photoId } = req.query;
    let product;
    try {
        product = await product_1.Product.findById(id);
    }
    catch (_a) {
        return next(new http_error_1.HttpError("Some error happened", 500));
    }
    if (!product) {
        return res.json({ message: "There is no such product" });
    }
    product.images = product.images.filter((photo) => photo.photoId !== photoId);
    if (photoId) {
        cloudinary_1.v2.uploader.destroy(photoId === null || photoId === void 0 ? void 0 : photoId.toString(), (err, result) => {
            console.log(err, result);
        });
    }
    try {
        await product.save();
    }
    catch (err) {
        return next(new http_error_1.HttpError("Some error happened", 500));
    }
    return res.json({ message: "Delete successfully" });
};
exports.deleteProductImages = deleteProductImages;
const changeProductMainImg = async (req, res, next) => {
    const { id } = req.params;
    const files = req.files;
    const mainImg = {
        photoId: files["mainImg"][0].filename,
        path: files["mainImg"][0].path,
    };
    let product;
    try {
        product = await product_1.Product.findById(id);
    }
    catch (err) {
        return next(new http_error_1.HttpError("Server error", 500));
    }
    if (!product) {
        return res.json({ message: "There is no such product" });
    }
    product.mainImg = mainImg;
    try {
        await product.save();
    }
    catch (err) {
        return next(new http_error_1.HttpError("Server error, please try again", 500));
    }
    res.json({ message: "Edit successfully" });
};
exports.changeProductMainImg = changeProductMainImg;
//# sourceMappingURL=products-controller.js.map