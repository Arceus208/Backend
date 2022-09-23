"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNewAccessToken = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const user_1 = require("../models/user");
const createToken_1 = require("../utils/createToken");
const setRefreshToken_1 = require("../utils/setRefreshToken");
const getNewAccessToken = async (req, res) => {
    const token = req.cookies.jid;
    if (!token) {
        return res.json({ accessToken: "" });
    }
    let payload;
    try {
        payload = (0, jsonwebtoken_1.verify)(token, process.env.REFRESH_TOKEN_SECRET);
    }
    catch (err) {
        return res.json({ accessToken: "" });
    }
    const user = await user_1.User.findById(payload.userId);
    if (!user) {
        return res.json({ accessToken: "" });
    }
    if (user.tokenVersion !== payload.tokenVersion) {
        return res.json({ accessToken: "" });
    }
    (0, setRefreshToken_1.setRefreshToken)(res, (0, createToken_1.createRefreshToken)(user));
    return res.json({ accessToken: (0, createToken_1.createAccessToken)(user) });
};
exports.getNewAccessToken = getNewAccessToken;
//# sourceMappingURL=getNewAccesToken.js.map