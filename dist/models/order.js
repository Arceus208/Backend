"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = void 0;
const mongoose_1 = require("mongoose");
const orderSchema = new mongoose_1.Schema({
    status: {
        type: String,
        required: true,
    },
    items: [
        {
            id: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: "Product" },
            name: { type: String, required: true },
            price: { type: Number, required: true },
            quantity: { type: Number, required: true },
            image: { type: String },
        },
    ],
    totalPrice: { type: Number, required: true },
    customerId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    customerEmail: { type: String, required: true },
    shippingAddress: {
        city: { type: String, required: true },
        postnumber: { type: String, required: true },
        street: { type: String, required: true },
        country: { type: String, required: true },
    },
    createAt: { type: Date, required: true, default: Date.now },
});
exports.Order = (0, mongoose_1.model)("Order", orderSchema);
//# sourceMappingURL=order.js.map