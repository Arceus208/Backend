"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setRefreshToken = void 0;
const setRefreshToken = (res, token) => {
    res.cookie("jid", token, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
    });
};
exports.setRefreshToken = setRefreshToken;
//# sourceMappingURL=setRefreshToken.js.map