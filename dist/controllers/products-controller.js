"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeProductMainImg = exports.deleteProductImages = exports.editProductPhotos = exports.editProduct = exports.getProductById = exports.getProductsByFilter = exports.createProduct = exports.getAllProducts = void 0;
const http_error_1 = require("../models/http-error");
const product_1 = require("../models/product");
const cloudinary_1 = require("cloudinary");
const uuid_1 = require("uuid");
const checkAdmin_1 = require("../middleware/checkAdmin");
const sortType_1 = require("../utils/sortType");
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
    try {
        await (0, checkAdmin_1.checkAdmin)(req, res, next);
    }
    catch (err) {
        return next(err);
    }
    const { name, description, price, category, quantity, subCategory, discount, } = req.body;
    const files = req.files;
    let mainImg;
    if (!files["mainImg"]) {
        mainImg = {
            photoId: (0, uuid_1.v4)(),
            path: "https://res.cloudinary.com/devnhm0jy/image/upload/v1663753614/Yugioh_shop/no-product-image_ydbimi.png",
        };
    }
    else {
        mainImg = {
            photoId: files["mainImg"][0].filename,
            path: files["mainImg"][0].path,
        };
    }
    let images;
    if (files["images"]) {
        images = files["images"].map((file) => {
            return { photoId: file.filename, path: file.path };
        });
    }
    else {
        images = [];
    }
    const product = new product_1.Product({
        name,
        description,
        price: parseFloat(price),
        category,
        mainImg,
        images,
        quantity: parseFloat(quantity),
        subCategory: JSON.parse(subCategory),
        discount: parseFloat(discount),
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
const getProductsByFilter = async (req, res, next) => {
    let { search, category, subCategory, limit, page, minPrice, maxPrice, isSale, sort, } = req.query;
    let pageLimit, currentPage;
    let match = {};
    if (search && search !== "null") {
        match = Object.assign(Object.assign({}, match), { $or: [
                { name: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
            ] });
    }
    if (category && category !== "undefined") {
        match = Object.assign(Object.assign({}, match), { category: category });
    }
    if (subCategory && subCategory !== "undefined") {
        let subQuery;
        if (typeof subCategory === "string" && subCategory.length !== 0) {
            subQuery = subCategory.split(" ");
        }
        match = Object.assign(Object.assign({}, match), { subCategory: { $in: subQuery } });
    }
    if (minPrice && maxPrice) {
        match = Object.assign(Object.assign({}, match), { $and: [
                { curPrice: { $gte: minPrice } },
                { curPrice: { $lte: maxPrice } },
            ] });
    }
    else {
        if (minPrice) {
            match = Object.assign(Object.assign({}, match), { curPrice: { $gte: minPrice } });
        }
        if (maxPrice) {
            match = Object.assign(Object.assign({}, match), { curPrice: { $lte: maxPrice } });
        }
    }
    if (isSale) {
        if (isSale === "true") {
            match = Object.assign(Object.assign({}, match), { discount: { $gt: 0 } });
        }
    }
    if (!page) {
        currentPage = 0;
    }
    else {
        currentPage = parseInt(page);
    }
    let products;
    if (!limit) {
        pageLimit = 20;
    }
    else {
        pageLimit = parseInt(limit);
    }
    try {
        if (sort) {
            if (sortType_1.sortType.includes(sort)) {
                let sortArray = (0, sortType_1.getSortParams)(sort);
                products = await product_1.Product.find(Object.assign({}, match))
                    .limit(pageLimit)
                    .skip(currentPage * pageLimit)
                    .sort([sortArray]);
            }
            else {
                products = await product_1.Product.find(Object.assign({}, match))
                    .limit(pageLimit)
                    .skip(currentPage * pageLimit);
            }
        }
        else {
            products = await product_1.Product.find(Object.assign({}, match))
                .limit(pageLimit)
                .skip(currentPage * pageLimit);
        }
    }
    catch (err) {
        return next(new http_error_1.HttpError("Server error", 500));
    }
    return res.status(201).json({
        products: products.map((product) => product.toObject({ getters: true })),
    });
};
exports.getProductsByFilter = getProductsByFilter;
const getProductById = async (req, res, next) => {
    const { id } = req.params;
    let product;
    try {
        product = await product_1.Product.findById(id);
        if (!product) {
            return next(new http_error_1.HttpError("There is no such product", 400));
        }
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
    try {
        await (0, checkAdmin_1.checkAdmin)(req, res, next);
    }
    catch (err) {
        return next(err);
    }
    const { id } = req.params;
    const { name, description, price, category, quantity, subCategory, discount, } = req.body;
    let product;
    try {
        product = await product_1.Product.findById(id);
    }
    catch (err) {
        return next(new http_error_1.HttpError("Server error", 500));
    }
    if (!product) {
        return next(new http_error_1.HttpError("There is no such product", 400));
    }
    try {
        product.name = name;
        product.description = description;
        product.price = parseFloat(price);
        product.category = category;
        product.quantity = parseFloat(quantity);
        product.subCategory = JSON.parse(subCategory);
        product.discount = parseFloat(discount);
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
    try {
        await (0, checkAdmin_1.checkAdmin)(req, res, next);
    }
    catch (err) {
        return next(err);
    }
    const { id } = req.params;
    let product;
    try {
        product = await product_1.Product.findById(id);
    }
    catch (err) {
        return next(new http_error_1.HttpError("Server error", 500));
    }
    const files = req.files;
    if (!files["images"]) {
        return next(new http_error_1.HttpError("Please provide an image", 400));
    }
    const images = files["images"].map((file) => {
        return { photoId: file.filename, path: file.path };
    });
    if (!product) {
        return next(new http_error_1.HttpError("There is no such product", 400));
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
    try {
        await (0, checkAdmin_1.checkAdmin)(req, res, next);
    }
    catch (err) {
        return next(err);
    }
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
        return next(new http_error_1.HttpError("There is no such product", 400));
    }
    product.images = product.images.filter((photo) => photo.photoId !== photoId);
    if (photoId) {
        cloudinary_1.v2.uploader.destroy(photoId === null || photoId === void 0 ? void 0 : photoId.toString(), (err) => {
            if (err) {
                console.log(err);
            }
        });
    }
    try {
        await product.save();
    }
    catch (err) {
        return next(new http_error_1.HttpError("Some error happened", 500));
    }
    return res.status(201).json({ message: "Delete successfully" });
};
exports.deleteProductImages = deleteProductImages;
const changeProductMainImg = async (req, res, next) => {
    try {
        await (0, checkAdmin_1.checkAdmin)(req, res, next);
    }
    catch (err) {
        return next(err);
    }
    const { id } = req.params;
    const files = req.files;
    if (!files["mainImg"]) {
        return next(new http_error_1.HttpError("Please provide an image", 400));
    }
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
        return next(new http_error_1.HttpError("There is no such product", 400));
    }
    product.mainImg = mainImg;
    try {
        await product.save();
    }
    catch (err) {
        return next(new http_error_1.HttpError("Server error, please try again", 500));
    }
    res.status(201).json({ message: "Edit successfully" });
};
exports.changeProductMainImg = changeProductMainImg;
//# sourceMappingURL=products-controller.js.map