import { RequestHandler } from "express";
import dotenv from "dotenv";
import paypal from "@paypal/checkout-server-sdk";
import { User } from "../models/user";
import { checkAdmin } from "../middleware/checkAdmin";
import { HttpError } from "../models/http-error";
import { Order } from "../models/order";
import { Product } from "../models/product";
import moment from "moment";

dotenv.config();

const Environment =
  process.env.NODE_ENV === "production"
    ? paypal.core.LiveEnvironment
    : paypal.core.SandboxEnvironment;

const paypalClient = new paypal.core.PayPalHttpClient(
  new Environment(
    process.env.PAYPAL_CLIENT_ID!,
    process.env.PAYPAL_CLIENT_SECRET!
  )
);

enum Category {
  DIGITAL_GOODS = "DIGITAL_GOODS",
  PHYSICAL_GOODS = "PHYSICAL_GOODS",
  DONATION = "DONATION",
}

export const createOrder: RequestHandler = async (req, res, next) => {
  try {
    const { items } = req.body;
    const itemsFromDB = await Promise.all(
      items.map(async (item: any) => {
        const product = await Product.findById(item.id);

        if (product) {
          product.quantity = product.quantity - item.quantity;
          product.unitSold = product.unitSold + item.quantity;

          return {
            name: product.name,
            id: product.id,
            price: product.curPrice,
            quantity: item.quantity,
          };
        } else {
          return Promise.reject("Cant find product");
        }
      })
    );

    const total = itemsFromDB.reduce((sum: number, item: any) => {
      return sum + item.price * item.quantity;
    }, 0);

    const request = new paypal.orders.OrdersCreateRequest();
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

          items: itemsFromDB.map((item: any) => {
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
  } catch (err) {
    console.log(err);
    return next(new HttpError("Some error occured", 500));
  }
};

export const captureOrder: RequestHandler = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { email, address, customerId } = req.body;
    if (orderId) {
      const request = new paypal.orders.OrdersCaptureRequest(orderId as string);
      await paypalClient.execute(request);

      const getOrderRequest = new paypal.orders.OrdersGetRequest(
        orderId as string
      );

      const data = await paypalClient.execute(getOrderRequest);

      const items = await Promise.all(
        data.result.purchase_units[0].items.map(async (item: any) => {
          const product = await Product.findById(item.description);

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
          } else {
            return Promise.reject("Cant find product");
          }
        })
      );

      let create_order = {
        status: data.result.status,
        items,
        shippingAddress: address,
        totalPrice: parseFloat(data.result.purchase_units[0].amount.value),
        customerEmail: email,
      } as any;

      let user;

      if (customerId) {
        user = await User.findById(customerId);
        if (user) {
          create_order.customerId = customerId;
        }
      }

      const order = new Order(create_order);

      if (user) {
        user.orders.push(order._id);
        await user.save();
      }

      await order.save();

      res.status(201).json({ message: "Order successfully" });
    } else {
      return next(new HttpError("Error by payment", 404));
    }
  } catch (err) {
    console.log(err);
    return next(new HttpError("Some error", 500));
  }
};

export const getTodaySales: RequestHandler = async (req, res, next) => {
  try {
    const date = new Date().toDateString();

    const todayOrders = await Order.find({ createAt: { $gte: date } });

    const total = todayOrders.reduce((sum, order) => sum + order.totalPrice, 0);

    res.status(201).json({
      total,
      numberOfOrders: todayOrders.length,
    });
  } catch (err) {
    return next(new HttpError("Some error occured", 500));
  }
};

export const getMonthSales: RequestHandler = async (req, res, next) => {
  try {
    const startOfMonth = moment().startOf("month").toDate();

    const currentMonthOrders = await Order.find({
      createAt: { $gte: startOfMonth },
    });

    const total = currentMonthOrders.reduce(
      (sum, order) => sum + order.totalPrice,
      0
    );

    res.status(201).json({
      total: total.toFixed(2),
      numberOfOrders: currentMonthOrders.length,
    });
  } catch (err) {
    return next(new HttpError("Some error occured", 500));
  }
};

export const getOrders: RequestHandler = async (req, res, next) => {
  try {
    await checkAdmin(req, res, next);
  } catch (err) {
    return next(err);
  }

  try {
    const { page, limit } = req.query;
    let pageLimit, currentPage;
    if (!page) {
      currentPage = 0;
    } else {
      currentPage = parseInt(page as string);
    }

    if (!limit) {
      pageLimit = 20;
    } else {
      pageLimit = parseInt(limit as string);
    }
    const orders = await Order.find({})
      .limit(pageLimit)
      .skip(currentPage * pageLimit);

    res.status(201).json({
      orders: orders.map((order) => order.toObject({ getters: true })),
    });
  } catch (err) {
    return next(new HttpError("Some error occured", 500));
  }
};

export const getOrderById: RequestHandler = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      return next(new HttpError("There is no such order", 401));
    }

    res.status(201).json({ order: order.toObject({ getters: true }) });
  } catch (err) {
    return next(new HttpError("Some error occured", 500));
  }
};

export const getCurrentWeekSales: RequestHandler = async (req, res, next) => {
  try {
    const currentDate = moment();

    const weekStart = currentDate.clone().startOf("isoWeek").toDate();

    const order = await Order.aggregate([
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
  } catch (err) {
    return next(new HttpError("Some error occured", 500));
  }
};

export const getCurrentYearSales: RequestHandler = async (req, res, next) => {
  try {
    const startOfYear = moment().startOf("year").toDate();
    const order = await Order.aggregate([
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
  } catch (err) {
    return next(new HttpError("Some error occured", 500));
  }
};
