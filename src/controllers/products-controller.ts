import { RequestHandler } from "express";

import { HttpError } from "../models/http-error";
import { Product } from "../models/product";
import { v2 } from "cloudinary";
import { v4 as uuidv4 } from "uuid";

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
  const { name, description, price, category, quantity, subCategory } =
    req.body;

  const files = req.files as {
    [fieldname: string]: Express.Multer.File[];
  };

  const mainImg = {
    photoId: files["mainImg"][0].filename,
    path: files["mainImg"][0].path,
  };

  const images = files["images"].map((file) => {
    return { photoId: file.filename, path: file.path };
  });

  const product = new Product({
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
  } catch (err) {
    return next(new HttpError("Could not create a new product", 500));
  }

  res.status(201).json({
    product: product.toObject({ getters: true }),
  });
};

export const increaseQuantity: RequestHandler = async (req, res, next) => {
  const pid = req.params.productId;
  const { value } = req.body;

  let product;
  try {
    product = await Product.findById({ pid });
  } catch (err) {
    return next(new HttpError("Error by getting product", 500));
  }

  if (!product) {
    return next(new HttpError("There is no such product", 422));
  }

  product.quantity = product.quantity + value;

  try {
    await product.save();
  } catch (err) {
    return next(new HttpError("Server error", 500));
  }

  res.status(201).json({ message: "Increase quantity successfully!" });
};

export const getProductsByFilter: RequestHandler = async (req, res, next) => {
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
    if (subCategory?.length !== 0) {
      products = await Product.find({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ],
        $and: [
          { category: { $regex: category, $options: "i" } },
          { subCategory: { $all: subQuery } },
        ],
      });
    } else {
      products = await Product.find({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ],

        $and: [{ category: { $regex: category, $options: "i" } }],
      });
    }
  } catch (err) {
    return next(new HttpError("Server error", 500));
  }

  return res.json({
    products: products.map((product) => product.toObject({ getters: true })),
  });
};

export const getProductById: RequestHandler = async (req, res, next) => {
  const { id } = req.params;

  let product;
  try {
    product = await Product.findById(id);
  } catch (err) {
    return next(new HttpError("Server error", 500));
  }

  return res
    .status(201)
    .json({ product: product?.toObject({ getters: true }) });
};

export const editProduct: RequestHandler = async (req, res, next) => {
  const { id } = req.params;

  const { name, description, price, category, quantity, subCategory } =
    req.body;

  let product;
  try {
    product = await Product.findById(id);
  } catch (err) {
    return next(new HttpError("Server error", 500));
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
  } catch (err) {
    return next(new HttpError("Some error happened, Please try again", 500));
  }

  return res.status(201).json({
    product: product.toObject({ getters: true }),
  });
};

export const editProductPhotos: RequestHandler = async (req, res, next) => {
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

  const images = files["images"].map((file) => {
    return { photoId: file.filename, path: file.path };
  });

  if (!product) {
    return res.status(201).json({ message: "There is no such product" });
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
  const { id } = req.params;
  const { photoId } = req.query;

  let product;

  try {
    product = await Product.findById(id);
  } catch {
    return next(new HttpError("Some error happened", 500));
  }

  if (!product) {
    return res.json({ message: "There is no such product" });
  }

  product.images = product.images.filter((photo) => photo.photoId !== photoId);

  if (photoId) {
    v2.uploader.destroy(photoId?.toString(), (err, result) => {
      console.log(err, result);
    });
  }

  try {
    await product.save();
  } catch (err) {
    return next(new HttpError("Some error happened", 500));
  }

  return res.json({ message: "Delete successfully" });
};

export const changeProductMainImg: RequestHandler = async (req, res, next) => {
  const { id } = req.params;

  const files = req.files as {
    [fieldname: string]: Express.Multer.File[];
  };

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
    return res.json({ message: "There is no such product" });
  }

  product.mainImg = mainImg;

  try {
    await product.save();
  } catch (err) {
    return next(new HttpError("Server error, please try again", 500));
  }

  res.json({ message: "Edit successfully" });
};
