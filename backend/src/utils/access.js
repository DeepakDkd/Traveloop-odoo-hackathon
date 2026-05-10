import prisma from "../lib/prisma.js";

export const getOwnedTrip = async (tripId, userId) => {
  return prisma.trip.findFirst({
    where: {
      id: tripId,
      userId,
    },
  });
};

export const getOwnedStop = async (stopId, userId) => {
  return prisma.stop.findFirst({
    where: {
      id: stopId,
      trip: {
        userId,
      },
    },
    include: {
      trip: true,
      city: true,
    },
  });
};

export const getOwnedExpense = async (expenseId, userId) => {
  return prisma.expense.findFirst({
    where: {
      id: expenseId,
      trip: {
        userId,
      },
    },
    include: {
      trip: true,
      stop: {
        include: {
          city: true,
        },
      },
    },
  });
};

export const isDateInsideTrip = (date, trip) => {
  return date >= trip.startDate && date <= trip.endDate;
};
