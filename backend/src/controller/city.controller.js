import prisma from "../lib/prisma.js";
import { sendError, sendSuccess } from "../utils/response.js";

const cityInclude = {
  activities: {
    take: 8,
    orderBy: {
      name: "asc",
    },
  },
};

export const searchCities = async (req, res) => {
  try {
    const { q, country, take = 20 } = req.query;

    const cities = await prisma.city.findMany({
      where: {
        ...(country && {
          country: {
            contains: country,
            mode: "insensitive",
          },
        }),
        ...(q && {
          OR: [
            {
              name: {
                contains: q,
                mode: "insensitive",
              },
            },
            {
              country: {
                contains: q,
                mode: "insensitive",
              },
            },
            {
              region: {
                contains: q,
                mode: "insensitive",
              },
            },
          ],
        }),
      },
      orderBy: [
        {
          popularity: "desc",
        },
        {
          name: "asc",
        },
      ],
      take: Number(take),
    });

    return sendSuccess(res, 200, cities);
  } catch (error) {
    console.error("[searchCities] Error:", error);
    return sendError(res, 500, "Internal server error.");
  }
};

export const getPopularCities = async (req, res) => {
  try {
    const cities = await prisma.city.findMany({
      orderBy: [
        {
          popularity: "desc",
        },
        {
          name: "asc",
        },
      ],
      take: 12,
    });

    return sendSuccess(res, 200, cities);
  } catch (error) {
    console.error("[getPopularCities] Error:", error);
    return sendError(res, 500, "Internal server error.");
  }
};

export const getCityById = async (req, res) => {
  try {
    const { cityId } = req.params;

    const city = await prisma.city.findUnique({
      where: {
        id: cityId,
      },
      include: cityInclude,
    });

    if (!city) {
      return sendError(res, 404, "City not found.");
    }

    return sendSuccess(res, 200, city);
  } catch (error) {
    console.error("[getCityById] Error:", error);
    return sendError(res, 500, "Internal server error.");
  }
};

export const saveCity = async (req, res) => {
  try {
    const { cityId } = req.params;

    const city = await prisma.city.findUnique({
      where: {
        id: cityId,
      },
    });

    if (!city) {
      return sendError(res, 404, "City not found.");
    }

    const savedCity = await prisma.savedCity.upsert({
      where: {
        userId_cityId: {
          userId: req.user.id,
          cityId,
        },
      },
      update: {},
      create: {
        userId: req.user.id,
        cityId,
      },
      include: {
        city: true,
      },
    });

    return sendSuccess(res, 201, savedCity, "City saved.");
  } catch (error) {
    console.error("[saveCity] Error:", error);
    return sendError(res, 500, "Internal server error.");
  }
};

export const unsaveCity = async (req, res) => {
  try {
    const { cityId } = req.params;

    await prisma.savedCity.delete({
      where: {
        userId_cityId: {
          userId: req.user.id,
          cityId,
        },
      },
    });

    return sendSuccess(res, 200, undefined, "City removed from saved cities.");
  } catch (error) {
    console.error("[unsaveCity] Error:", error);

    if (error.code === "P2025") {
      return sendError(res, 404, "Saved city not found.");
    }

    return sendError(res, 500, "Internal server error.");
  }
};

export const getSavedCities = async (req, res) => {
  try {
    const savedCities = await prisma.savedCity.findMany({
      where: {
        userId: req.user.id,
      },
      include: {
        city: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return sendSuccess(res, 200, savedCities);
  } catch (error) {
    console.error("[getSavedCities] Error:", error);
    return sendError(res, 500, "Internal server error.");
  }
};
