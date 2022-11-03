"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllEvents = exports.getTodayEvents = exports.deleteEvent = exports.editEvent = exports.createEvent = void 0;
const event_1 = require("../models/event");
const http_error_1 = require("../models/http-error");
const moment_1 = __importDefault(require("moment"));
const createEvent = async (req, res, next) => {
    try {
        const { id, title, start, end, allDay } = req.body;
        const event = new event_1.Event({
            _id: id,
            title,
            start,
            end,
            allDay,
        });
        await event.save();
        res.status(201).json({ event });
    }
    catch (err) {
        return next(new http_error_1.HttpError("Some error occured", 500));
    }
};
exports.createEvent = createEvent;
const editEvent = async (req, res, next) => {
    try {
        const { id, start, end, allDay, title } = req.body;
        const event = await event_1.Event.findById(id);
        if (!event) {
            return next(new http_error_1.HttpError("There is no such event", 401));
        }
        (event.start = start),
            (event.end = end),
            (event.allDay = allDay),
            (event.title = title),
            await event.save();
        res.status(201).json({ event });
    }
    catch (err) {
        return next(new http_error_1.HttpError("Some error occured", 500));
    }
};
exports.editEvent = editEvent;
const deleteEvent = async (req, res, next) => {
    try {
        const { id } = req.params;
        await event_1.Event.deleteOne({ _id: id });
        res.status(201).json({ message: "Delete successfully" });
    }
    catch (err) {
        return next(new http_error_1.HttpError("Some error occured", 500));
    }
};
exports.deleteEvent = deleteEvent;
const getTodayEvents = async (req, res, next) => {
    try {
        const startOfDay = (0, moment_1.default)().startOf("day").toDate();
        const endOfDay = (0, moment_1.default)().endOf("day").toDate();
        const events = await event_1.Event.find({
            $and: [{ start: { $gte: startOfDay } }, { start: { $lte: endOfDay } }],
        }).sort({ start: 1 });
        res.status(201).json({
            events: events.map((event) => event.toObject({ getters: true })),
        });
    }
    catch (err) {
        return next(new http_error_1.HttpError("Some error occured", 500));
    }
};
exports.getTodayEvents = getTodayEvents;
const getAllEvents = async (req, res, next) => {
    try {
        const events = await event_1.Event.find({});
        res.status(201).json({
            events: events.map((event) => event.toObject({ getters: true })),
        });
    }
    catch (err) {
        return next(new http_error_1.HttpError("Some error occured", 500));
    }
};
exports.getAllEvents = getAllEvents;
//# sourceMappingURL=event-controller.js.map