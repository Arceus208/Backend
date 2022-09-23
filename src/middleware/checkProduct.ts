import { body, validationResult } from "express-validator";
import { RequestHandler } from "express";

interface errorObject {
  [name: string]: string;
}

export const productValidationRules = () => {
  return [
    body("name").isString().isLength({ min: 1 }),
    body("price").toFloat().isFloat({ gt: 0 }),
    body("description").isString(),
    body("category").isString().isIn(["cards", "box", "accessory"]),
    body("quantity").toFloat().isFloat({ gt: 0 }),
  ];
};

export const validateProduct: RequestHandler = (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }

  const error = validationResult(req);

  if (error.isEmpty()) {
    return next();
  }

  const extratedErrors: errorObject[] = [];
  error.array().map((err) => extratedErrors.push({ [err.param]: err.msg }));

  return res.status(422).json({ errors: extratedErrors });
};
