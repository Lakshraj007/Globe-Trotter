import { Router } from "express";
import { createTripController } from "../controllers/trip.controller.js";

const router = Router();

router.post("/", createTripController);

export default router;