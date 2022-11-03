import { Router } from "express";
import {
  createEvent,
  deleteEvent,
  editEvent,
  getAllEvents,
  getTodayEvents,
} from "../controllers/event-controller";

const router = Router();

router.get("/getAllEvents", getAllEvents);

router.get("/todayEvents", getTodayEvents);

router.post("/newEvent", createEvent);

router.patch("/editEvent", editEvent);

router.delete("/deleteEvent/:id", deleteEvent);

export default router;
