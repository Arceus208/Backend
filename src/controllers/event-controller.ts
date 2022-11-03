import { RequestHandler } from "express";
import { Event } from "../models/event";
import { HttpError } from "../models/http-error";
import moment from "moment";

export const createEvent: RequestHandler = async (req, res, next) => {
  try {
    const { id, title, start, end, allDay } = req.body;

    const event = new Event({
      _id: id,
      title,
      start,
      end,
      allDay,
    });

    await event.save();

    res.status(201).json({ event });
  } catch (err) {
    return next(new HttpError("Some error occured", 500));
  }
};

export const editEvent: RequestHandler = async (req, res, next) => {
  try {
    const { id, start, end, allDay, title } = req.body;

    const event = await Event.findById(id);

    if (!event) {
      return next(new HttpError("There is no such event", 401));
    }

    (event.start = start),
      (event.end = end),
      (event.allDay = allDay),
      (event.title = title),
      await event.save();

    res.status(201).json({ event });
  } catch (err) {
    return next(new HttpError("Some error occured", 500));
  }
};

export const deleteEvent: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;

    await Event.deleteOne({ _id: id });

    res.status(201).json({ message: "Delete successfully" });
  } catch (err) {
    return next(new HttpError("Some error occured", 500));
  }
};

export const getTodayEvents: RequestHandler = async (req, res, next) => {
  try {
    const startOfDay = moment().startOf("day").toDate();
    const endOfDay = moment().endOf("day").toDate();

    const events = await Event.find({
      $and: [{ start: { $gte: startOfDay } }, { start: { $lte: endOfDay } }],
    }).sort({ start: 1 });

    res.status(201).json({
      events: events.map((event) => event.toObject({ getters: true })),
    });
  } catch (err) {
    return next(new HttpError("Some error occured", 500));
  }
};

export const getAllEvents: RequestHandler = async (req, res, next) => {
  try {
    const events = await Event.find({});

    res.status(201).json({
      events: events.map((event) => event.toObject({ getters: true })),
    });
  } catch (err) {
    return next(new HttpError("Some error occured", 500));
  }
};
