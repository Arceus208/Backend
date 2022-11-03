"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Event = void 0;
const mongoose_1 = require("mongoose");
const eventSchema = new mongoose_1.Schema({
    _id: { type: String, required: true },
    title: { type: String, required: true },
    start: { type: Date, required: true },
    end: { type: Date },
    allDay: { type: Boolean, required: true },
}, { _id: false });
exports.Event = (0, mongoose_1.model)("Event", eventSchema);
//# sourceMappingURL=event.js.map