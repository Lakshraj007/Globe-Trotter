import { prisma } from "../db/prisma.js";

export interface CreateTripInput {
  userId: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  budget?: number;
  currency?: string;
}

export async function createTrip(data: CreateTripInput) {
  return prisma.trip.create({
    data: {
      userId: data.userId,
      title: data.title,
      description: data.description,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      budget: data.budget,
      currency: data.currency ?? "INR",
    },
  });
}