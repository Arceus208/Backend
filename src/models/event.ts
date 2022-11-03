import { Schema, model } from "mongoose";

export interface IEvent {
  _id: String;
  title: String;
  start: Date;
  end: Date;
  allDay: boolean;
}

const eventSchema = new Schema<IEvent>(
  {
    _id: { type: String, required: true },
    title: { type: String, required: true },
    start: { type: Date, required: true },
    end: { type: Date },
    allDay: { type: Boolean, required: true },
  },
  { _id: false }
);

export const Event = model<IEvent>("Event", eventSchema);
