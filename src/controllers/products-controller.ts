import { RequestHandler } from "express";

import { HttpError } from "../models/http-error";
import { Product } from "../models/product";
import { v2 } from "cloudinary";
import { v4 as uuidv4 } from "uuid";

import { checkAdmin } from "../middleware/checkAdmin";
import { getSortParams, sortType } from "../utils/sortType";

export const getAllProducts: RequestHandler = async (req, res, next) => {
  let products;
  let page;

  if (req.query.page) {
    page = parseInt(req.query.page as string);
  } else {
    page = 1;
  }

  const limit = 20;
  const skip = (page - 1) * limit;

  try {
    products = await Product.find({}).skip(skip).limit(limit);
  } catch (err) {
    return next(new HttpError("Can't get products", 500));
  }

  res.status(201).json({
    products: products.map((product) => product.toObject({ getters: true })),
  });
};

export const createProduct: RequestHandler = async (req, res, next) => {
  try {
    await checkAdmin(req, res, next);
  } catch (err) {
    return next(err);
  }

  const {
    name,
    description,
    price,
    category,
    quantity,
    subCategory,
    discount,
  } = req.body;

  const files = req.files as {
    [fieldname: string]: Express.Multer.File[];
  };

  let mainImg;
  if (!files["mainImg"]) {
    mainImg = {
      photoId: uuidv4(),
      path: "https://res.cloudinary.com/devnhm0jy/image/upload/v1663753614/Yugioh_shop/no-product-image_ydbimi.png",
    };
  } else {
    mainImg = {
      photoId: files["mainImg"][0].filename,
      path: files["mainImg"][0].path,
    };
  }

  let images: any;
  if (files["images"]) {
    images = files["images"].map((file) => {
      return { photoId: file.filename, path: file.path };
    });
  } else {
    images = [];
  }

  const product = new Product({
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
  } catch (err) {
    return next(new HttpError("Could not create a new product", 500));
  }

  res.status(201).json({
    product: product.toObject({ getters: true }),
  });
};

export const getProductsByFilter: RequestHandler = async (req, res, next) => {
  let {
    search,
    category,
    subCategory,
    limit,
    page,
    minPrice,
    maxPrice,
    isSale,
    sort,
  } = req.query;
  let pageLimit, currentPage;
  let match = {} as any;

  if (search && search !== "null") {
    match = {
      ...match,
      $or: [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ],
    };
  }

  if (category && category !== "undefined") {
    match = { ...match, category: category };
  }

  if (subCategory && subCategory !== "undefined") {
    let subQuery;

    if (typeof subCategory === "string" && subCategory.length !== 0) {
      subQuery = subCategory.split(" ");
    }

    match = { ...match, subCategory: { $in: subQuery } };
  }

  if (minPrice && maxPrice) {
    match = {
      ...match,
      $and: [
        { curPrice: { $gte: minPrice } },
        { curPrice: { $lte: maxPrice } },
      ],
    };
  } else {
    if (minPrice) {
      match = {
        ...match,
        curPrice: { $gte: minPrice },
      };
    }

    if (maxPrice) {
      match = {
        ...match,
        curPrice: { $lte: maxPrice },
      };
    }
  }

  if (isSale) {
    if (isSale === "true") {
      match = { ...match, discount: { $gt: 0 } };
    }
  }

  if (!page) {
    currentPage = 0;
  } else {
    currentPage = parseInt(page as string);
  }

  let products;

  if (!limit) {
    pageLimit = 20;
  } else {
    pageLimit = parseInt(limit as string);
  }

  try {
    if (sort) {
      if (sortType.includes(sort as string)) {
        let sortArray = getSortParams(sort as string);

        products = await Product.find({ ...match })
          .limit(pageLimit)
          .skip(currentPage * pageLimit)
          .sort([sortArray]);
      } else {
        products = await Product.find({ ...match })
          .limit(pageLimit)
          .skip(currentPage * pageLimit);
      }
    } else {
      products = await Product.find({ ...match })
        .limit(pageLimit)
        .skip(currentPage * pageLimit);
    }
  } catch (err) {
    return next(new HttpError("Server error", 500));
  }

  return res.status(201).json({
    products: products.map((product) => product.toObject({ getters: true })),
  });
};

export const getProductById: RequestHandler = async (req, res, next) => {
  const { id } = req.params;

  let product;
  try {
    product = await Product.findById(id);
    if (!product) {
      return next(new HttpError("There is no such product", 400));
    }
  } catch (err) {
    return next(new HttpError("Server error", 500));
  }

  return res
    .status(201)
    .json({ product: product?.toObject({ getters: true }) });
};

export const editProduct: RequestHandler = async (req, res, next) => {
  try {
    await checkAdmin(req, res, next);
  } catch (err) {
    return next(err);
  }

  const { id } = req.params;

  const {
    name,
    description,
    price,
    category,
    quantity,
    subCategory,
    discount,
  } = req.body;

  let product;
  try {
    product = await Product.findById(id);
  } catch (err) {
    return next(new HttpError("Server error", 500));
  }

  if (!product) {
    return next(new HttpError("There is no such product", 400));
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
  } catch (err) {
    return next(new HttpError("Some error happened, Please try again", 500));
  }

  return res.status(201).json({
    product: product.toObject({ getters: true }),
  });
};

export const editProductPhotos: RequestHandler = async (req, res, next) => {
  try {
    await checkAdmin(req, res, next);
  } catch (err) {
    return next(err);
  }

  const { id } = req.params;
  let product;
  try {
    product = await Product.findById(id);
  } catch (err) {
    return next(new HttpError("Server error", 500));
  }

  const files = req.files as {
    [fieldname: string]: Express.Multer.File[];
  };

  if (!files["images"]) {
    return next(new HttpError("Please provide an image", 400));
  }

  const images = files["images"].map((file) => {
    return { photoId: file.filename, path: file.path };
  });

  if (!product) {
    return next(new HttpError("There is no such product", 400));
  }

  product.images.push(...images);

  try {
    product.save();
  } catch (err) {
    return next(new HttpError("Some error happened, Please try again", 500));
  }

  return res.status(201).json({ message: "Edit successfully" });
};

export const deleteProductImages: RequestHandler = async (req, res, next) => {
  try {
    await checkAdmin(req, res, next);
  } catch (err) {
    return next(err);
  }
  const { id } = req.params;
  const { photoId } = req.query;

  let product;

  try {
    product = await Product.findById(id);
  } catch {
    return next(new HttpError("Some error happened", 500));
  }

  if (!product) {
    return next(new HttpError("There is no such product", 400));
  }

  product.images = product.images.filter((photo) => photo.photoId !== photoId);

  if (photoId) {
    v2.uploader.destroy(photoId?.toString(), (err) => {
      if (err) {
        console.log(err);
      }
    });
  }

  try {
    await product.save();
  } catch (err) {
    return next(new HttpError("Some error happened", 500));
  }

  return res.status(201).json({ message: "Delete successfully" });
};

export const changeProductMainImg: RequestHandler = async (req, res, next) => {
  try {
    await checkAdmin(req, res, next);
  } catch (err) {
    return next(err);
  }
  const { id } = req.params;

  const files = req.files as {
    [fieldname: string]: Express.Multer.File[];
  };

  if (!files["mainImg"]) {
    return next(new HttpError("Please provide an image", 400));
  }

  const mainImg = {
    photoId: files["mainImg"][0].filename,
    path: files["mainImg"][0].path,
  };

  let product;

  try {
    product = await Product.findById(id);
  } catch (err) {
    return next(new HttpError("Server error", 500));
  }

  if (!product) {
    return next(new HttpError("There is no such product", 400));
  }

  product.mainImg = mainImg;

  try {
    await product.save();
  } catch (err) {
    return next(new HttpError("Server error, please try again", 500));
  }

  res.status(201).json({ message: "Edit successfully" });
};
