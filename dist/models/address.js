"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Address = void 0;
const mongoose_1 = require("mongoose");
const addressSchema = new mongoose_1.Schema({
    city: { type: String, required: true },
    postnumber: { type: String, required: true },
    street: { type: String, required: true },
    country: { type: String, required: true },
});
exports.Address = (0, mongoose_1.model)("Role", addressSchema);
//# sourceMappingURL=address.js.map