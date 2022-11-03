import { v2 } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import { Options } from "multer-storage-cloudinary";

declare interface cloudinaryOptions extends Options {
  params: {
    folder: string;
    allowedFormats: string[];
    public_id: (req: any, file: any) => string;
  };
}

const MIME_TYPE_MAP = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

v2.config({
  cloud_name: "devnhm0jy",
  api_key: "524256123769897",
  api_secret: "9SeDBf6fFzYVU7Spsc5nGBmPiKY",
});

const multerOpts: cloudinaryOptions = {
  cloudinary: v2,
  params: {
    folder: "Yugioh_shop",
    allowedFormats: ["jpeg", "png", "jpg"],

    public_id: (_: any, file: any) => {
      let uniqFileName = file.originalname.replace(/\.jpeg|\.jpg|\.png/gi, "");
      uniqFileName += uuidv4();
      return uniqFileName;
    },
  },
};

const storage = new CloudinaryStorage(multerOpts);

export const fileUpload = multer({
  storage,
  fileFilter: (_, file, cb) => {
    if (!MIME_TYPE_MAP.includes(file.mimetype)) {
      return cb(new Error("Wrong file type!"));
    }
    cb(null, true);
  },
});
