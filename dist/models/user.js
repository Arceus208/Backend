"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    tokenVersion: { type: Number, required: true },
    role: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: "Role" },
    address: {
        type: {
            city: { type: String, required: true },
            postnumber: { type: String, required: true },
            street: { type: String, required: true },
            country: { type: String, required: true },
        },
    },
    createAt: { type: Date, required: true, default: Date.now },
    orders: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Order" }],
});
exports.User = (0, mongoose_1.model)("User", userSchema);
//# sourceMappingURL=user.js.map