"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileUpload = void 0;
const cloudinary_1 = require("cloudinary");
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const multer_1 = __importDefault(require("multer"));
const uuid_1 = require("uuid");
const MIME_TYPE_MAP = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
cloudinary_1.v2.config({
    cloud_name: "devnhm0jy",
    api_key: "524256123769897",
    api_secret: "9SeDBf6fFzYVU7Spsc5nGBmPiKY",
});
const multerOpts = {
    cloudinary: cloudinary_1.v2,
    params: {
        folder: "Yugioh_shop",
        allowedFormats: ["jpeg", "png", "jpg"],
        public_id: (_, file) => {
            let uniqFileName = file.originalname.replace(/\.jpeg|\.jpg|\.png/gi, "");
            uniqFileName += (0, uuid_1.v4)();
            return uniqFileName;
        },
    },
};
const storage = new multer_storage_cloudinary_1.CloudinaryStorage(multerOpts);
exports.fileUpload = (0, multer_1.default)({
    storage,
    fileFilter: (_, file, cb) => {
        if (!MIME_TYPE_MAP.includes(file.mimetype)) {
            return cb(new Error("Wrong file type!"));
        }
        cb(null, true);
    },
});
//# sourceMappingURL=cloudinary_upload.js.map