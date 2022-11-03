"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentYearSales = exports.getCurrentWeekSales = exports.getOrderById = exports.getOrders = exports.getMonthSales = exports.getTodaySales = exports.captureOrder = exports.createOrder = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const checkout_server_sdk_1 = __importDefault(require("@paypal/checkout-server-sdk"));
const user_1 = require("../models/user");
const checkAdmin_1 = require("../middleware/checkAdmin");
const http_error_1 = require("../models/http-error");
const order_1 = require("../models/order");
const product_1 = require("../models/product");
const moment_1 = __importDefault(require("moment"));
dotenv_1.default.config();
const Environment = process.env.NODE_ENV === "production"
    ? checkout_server_sdk_1.default.core.LiveEnvironment
    : checkout_server_sdk_1.default.core.SandboxEnvironment;
const paypalClient = new checkout_server_sdk_1.default.core.PayPalHttpClient(new Environment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET));
var Category;
(function (Category) {
    Category["DIGITAL_GOODS"] = "DIGITAL_GOODS";
    Category["PHYSICAL_GOODS"] = "PHYSICAL_GOODS";
    Category["DONATION"] = "DONATION";
})(Category || (Category = {}));
const createOrder = async (req, res, next) => {
    try {
        const { items } = req.body;
        const itemsFromDB = await Promise.all(items.map(async (item) => {
            const product = await product_1.Product.findById(item.id);
            if (product) {
                product.quantity = product.quantity - item.quantity;
                product.unitSold = product.unitSold + item.quantity;
                return {
                    name: product.name,
                    id: product.id,
                    price: product.curPrice,
                    quantity: item.quantity,
                };
            }
            else {
                return Promise.reject("Cant find product");
            }
        }));
        const total = itemsFromDB.reduce((sum, item) => {
            return sum + item.price * item.quantity;
        }, 0);
        const request = new checkout_server_sdk_1.default.orders.OrdersCreateRequest();
        request.prefer("return=representation");
        request.requestBody({
            intent: "CAPTURE",
            purchase_units: [
                {
                    amount: {
                        currency_code: "EUR",
                        value: total.toString(),
                        breakdown: {
                            discount: { currency_code: "EUR", value: "0" },
                            handling: { currency_code: "EUR", value: "0" },
                            insurance: { currency_code: "EUR", value: "0" },
                            shipping_discount: { currency_code: "EUR", value: "0" },
                            shipping: { currency_code: "EUR", value: "0" },
                            tax_total: { currency_code: "EUR", value: "0" },
                            item_total: {
                                currency_code: "EUR",
                                value: total.toString(),
                            },
                        },
                    },
                    items: itemsFromDB.map((item) => {
                        return {
                            description: item.id,
                            name: item.name,
                            unit_amount: {
                                currency_code: "EUR",
                                value: item.price,
                            },
                            quantity: item.quantity,
                            category: Category.PHYSICAL_GOODS,
                        };
                    }),
                },
            ],
        });
        const order = await paypalClient.execute(request);
        res.status(201).json({ id: order.result.id });
    }
    catch (err) {
        console.log(err);
        return next(new http_error_1.HttpError("Some error occured", 500));
    }
};
exports.createOrder = createOrder;
const captureOrder = async (req, res, next) => {
    try {
        const { orderId } = req.params;
        const { email, address, customerId } = req.body;
        if (orderId) {
            const request = new checkout_server_sdk_1.default.orders.OrdersCaptureRequest(orderId);
            await paypalClient.execute(request);
            const getOrderRequest = new checkout_server_sdk_1.default.orders.OrdersGetRequest(orderId);
            const data = await paypalClient.execute(getOrderRequest);
            const items = await Promise.all(data.result.purchase_units[0].items.map(async (item) => {
                const product = await product_1.Product.findById(item.description);
                if (product) {
                    product.quantity = product.quantity - item.quantity;
                    product.unitSold = product.unitSold + item.quantity;
                    await product.save();
                    return {
                        name: product.name,
                        id: product.id,
                        price: product.curPrice,
                        quantity: item.quantity,
                        image: product.mainImg.path,
                    };
                }
                else {
                    return Promise.reject("Cant find product");
                }
            }));
            let create_order = {
                status: data.result.status,
                items,
                shippingAddress: address,
                totalPrice: parseFloat(data.result.purchase_units[0].amount.value),
                customerEmail: email,
            };
            let user;
            if (customerId) {
                user = await user_1.User.findById(customerId);
                if (user) {
                    create_order.customerId = customerId;
                }
            }
            const order = new order_1.Order(create_order);
            if (user) {
                user.orders.push(order._id);
                await user.save();
            }
            await order.save();
            res.status(201).json({ message: "Order successfully" });
        }
        else {
            return next(new http_error_1.HttpError("Error by payment", 404));
        }
    }
    catch (err) {
        console.log(err);
        return next(new http_error_1.HttpError("Some error", 500));
    }
};
exports.captureOrder = captureOrder;
const getTodaySales = async (req, res, next) => {
    try {
        const date = new Date().toDateString();
        const todayOrders = await order_1.Order.find({ createAt: { $gte: date } });
        const total = todayOrders.reduce((sum, order) => sum + order.totalPrice, 0);
        res.status(201).json({
            total,
            numberOfOrders: todayOrders.length,
        });
    }
    catch (err) {
        return next(new http_error_1.HttpError("Some error occured", 500));
    }
};
exports.getTodaySales = getTodaySales;
const getMonthSales = async (req, res, next) => {
    try {
        const startOfMonth = (0, moment_1.default)().startOf("month").toDate();
        const currentMonthOrders = await order_1.Order.find({
            createAt: { $gte: startOfMonth },
        });
        const total = currentMonthOrders.reduce((sum, order) => sum + order.totalPrice, 0);
        res.status(201).json({
            total: total.toFixed(2),
            numberOfOrders: currentMonthOrders.length,
        });
    }
    catch (err) {
        return next(new http_error_1.HttpError("Some error occured", 500));
    }
};
exports.getMonthSales = getMonthSales;
const getOrders = async (req, res, next) => {
    try {
        await (0, checkAdmin_1.checkAdmin)(req, res, next);
    }
    catch (err) {
        return next(err);
    }
    try {
        const { page, limit } = req.query;
        let pageLimit, currentPage;
        if (!page) {
            currentPage = 0;
        }
        else {
            currentPage = parseInt(page);
        }
        if (!limit) {
            pageLimit = 20;
        }
        else {
            pageLimit = parseInt(limit);
        }
        const orders = await order_1.Order.find({})
            .limit(pageLimit)
            .skip(currentPage * pageLimit);
        res.status(201).json({
            orders: orders.map((order) => order.toObject({ getters: true })),
        });
    }
    catch (err) {
        return next(new http_error_1.HttpError("Some error occured", 500));
    }
};
exports.getOrders = getOrders;
const getOrderById = async (req, res, next) => {
    try {
        const { orderId } = req.params;
        const order = await order_1.Order.findById(orderId);
        if (!order) {
            return next(new http_error_1.HttpError("There is no such order", 401));
        }
        res.status(201).json({ order: order.toObject({ getters: true }) });
    }
    catch (err) {
        return next(new http_error_1.HttpError("Some error occured", 500));
    }
};
exports.getOrderById = getOrderById;
const getCurrentWeekSales = async (req, res, next) => {
    try {
        const currentDate = (0, moment_1.default)();
        const weekStart = currentDate.clone().startOf("isoWeek").toDate();
        const order = await order_1.Order.aggregate([
            { $match: { createAt: { $gte: weekStart } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%m/%d", date: "$createAt" } },
                    sum: { $sum: "$totalPrice" },
                },
            },
            { $sort: { _id: 1 } },
        ]);
        res.status(201).json({ order });
    }
    catch (err) {
        return next(new http_error_1.HttpError("Some error occured", 500));
    }
};
exports.getCurrentWeekSales = getCurrentWeekSales;
const getCurrentYearSales = async (req, res, next) => {
    try {
        const startOfYear = (0, moment_1.default)().startOf("year").toDate();
        const order = await order_1.Order.aggregate([
            { $match: { createAt: { $gte: startOfYear } } },
            {
                $group: {
                    _id: { $month: "$createAt" },
                    sum: { $sum: "$totalPrice" },
                },
            },
            { $sort: { _id: 1 } },
        ]);
        res.status(201).json({ order });
    }
    catch (err) {
        return next(new http_error_1.HttpError("Some error occured", 500));
    }
};
exports.getCurrentYearSales = getCurrentYearSales;
//# sourceMappingURL=order-controller.js.map