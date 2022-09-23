import { body, validationResult } from "express-validator";
import { RequestHandler } from "express";

interface errorObject {
  [name: string]: string;
}

export const userValidationRules = () => {
  return [
    body("name").isString().isLength({ min: 5 }),
    body("email").isEmail(),
    body("password").matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/),
  ];
};

export const validateUser: RequestHandler = (req, res, next) => {
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
