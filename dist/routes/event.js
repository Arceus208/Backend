"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const event_controller_1 = require("../controllers/event-controller");
const router = (0, express_1.Router)();
router.get("/getAllEvents", event_controller_1.getAllEvents);
router.get("/todayEvents", event_controller_1.getTodayEvents);
router.post("/newEvent", event_controller_1.createEvent);
router.patch("/editEvent", event_controller_1.editEvent);
router.delete("/deleteEvent/:id", event_controller_1.deleteEvent);
exports.default = router;
//# sourceMappingURL=event.js.map