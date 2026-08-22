import type { Request, Response } from "express";
import { createTrip } from "../services/trip.service.js";

export async function createTripController(
  req: Request,
  res: Response
) {
  try {
    const trip = await createTrip(req.body);

    res.status(201).json(trip);
  } catch (error) {
    console.error("Failed to create trip:", error);

    res.status(500).json({
      error: "Failed to create trip",
    });
  }
}