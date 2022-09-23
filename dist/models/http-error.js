"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpError = void 0;
class HttpError extends Error {
    constructor(message, errorCode) {
        super(message);
        this.code = errorCode;
    }
}
exports.HttpError = HttpError;
//# sourceMappingURL=http-error.js.map