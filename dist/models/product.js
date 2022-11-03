"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
const mongoose_1 = require("mongoose");
const productSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    curPrice: {
        type: Number,
    },
    description: { type: String, required: true },
    mainImg: { type: { photoId: String, path: String } },
    images: { type: [{ photoId: String, path: String }] },
    category: {
        type: String,
        required: true,
        enum: ["card", "cards", "accessory"],
    },
    subCategory: { type: [String], required: true },
    quantity: { type: Number, required: true, min: 0 },
    unitSold: { type: Number, default: 0 },
    createAt: { type: Date, required: true, default: Date.now },
});
productSchema.pre("save", function (next) {
    this.curPrice = this.price - (this.discount * this.price) / 100;
    next();
});
exports.Product = (0, mongoose_1.model)("Product", productSchema);
//# sourceMappingURL=product.js.map