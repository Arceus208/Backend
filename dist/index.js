"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const http_error_1 = require("./models/http-error");
const products_1 = __importDefault(require("./routes/products"));
const users_1 = __importDefault(require("./routes/users"));
const orders_1 = __importDefault(require("./routes/orders"));
const event_1 = __importDefault(require("./routes/event"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const getNewAccesToken_1 = require("./middleware/getNewAccesToken");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT;
const username = process.env.MONGO_USERNAME;
const password = process.env.MONGO_PASSWORD;
app.set("trust proxy", process.env.NODE_ENV !== "production");
app.use((0, cors_1.default)({
    origin: [`${process.env.FRONT_END_HOST}`, `${process.env.FRONT_END_ADMIN}`],
    credentials: true,
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use("/products", products_1.default);
app.use("/users", users_1.default);
app.use("/order", orders_1.default);
app.use("/events", event_1.default);
app.get("/refresh_token", getNewAccesToken_1.getNewAccessToken);
app.use(() => {
    const error = new http_error_1.HttpError("Could not find this route", 404);
    throw error;
});
app.use((err, req, res, next) => {
    res.status(err.code || 500);
    res.json({ message: err.message || err });
});
mongoose_1.default
    .connect(`mongodb+srv://${username}:${password}@cluster0.ohts1.mongodb.net/ecommerce?retryWrites=true&w=majority`)
    .then(() => {
    app.listen(port, () => {
        console.log("connect to server");
    });
})
    .catch((err) => {
    console.log(err);
});
//# sourceMappingURL=index.js.map