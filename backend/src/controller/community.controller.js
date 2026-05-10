import crypto from "crypto";
import prisma from "../lib/prisma.js";
import { getOwnedTrip } from "../utils/access.js";
import { sendError, sendSuccess } from "../utils/response.js";

const publicTripInclude = {
  user: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      photo: true,
      city: true,
      country: true,
    },
  },
  stops: {
    include: {
      city: true,
      activities: {
        include: {
          activity: true,
        },
      },
    },
    orderBy: {
      order: "asc",
    },
  },
  budget: true,
  expenses: true,
  community: true,
};

export const publishTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    const trip = await getOwnedTrip(tripId, req.user.id);

    if (!trip) {
      return sendError(res, 404, "Trip not found.");
    }

    const shareToken = trip.shareToken || crypto.randomBytes(16).toString("hex");

    const updatedTrip = await prisma.trip.update({
      where: {
        id: tripId,
      },
      data: {
        isPublic: true,
        shareToken,
        community: {
          upsert: {
            create: {
              caption: req.body.caption || null,
            },
            update: {
              caption: req.body.caption ?? undefined,
            },
          },
        },
      },
      include: publicTripInclude,
    });

    return sendSuccess(res, 200, updatedTrip, "Trip published successfully.");
  } catch (error) {
    console.error("[publishTrip] Error:", error);
    return sendError(res, 500, "Internal server error.");
  }
};

export const getCommunityFeed = async (req, res) => {
  try {
    const { q, cityId, country, category, sort = "createdAt", order = "desc", take = 20 } = req.query;
    const sortableFields = ["createdAt", "likes", "views"];
    const sortField = sortableFields.includes(sort) ? sort : "createdAt";
    const tripAndFilters = [];

    if (cityId) {
      tripAndFilters.push({
        stops: {
          some: {
            cityId,
          },
        },
      });
    }

    if (country) {
      tripAndFilters.push({
        stops: {
          some: {
            city: {
              country: {
                contains: country,
                mode: "insensitive",
              },
            },
          },
        },
      });
    }

    if (category) {
      tripAndFilters.push({
        stops: {
          some: {
            activities: {
              some: {
                activity: {
                  category,
                },
              },
            },
          },
        },
      });
    }

    const posts = await prisma.communityPost.findMany({
      where: {
        trip: {
          isPublic: true,
          ...(tripAndFilters.length && { AND: tripAndFilters }),
          ...(q && {
            OR: [
              {
                name: {
                  contains: q,
                  mode: "insensitive",
                },
              },
              {
                description: {
                  contains: q,
                  mode: "insensitive",
                },
              },
              {
                stops: {
                  some: {
                    city: {
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
                      ],
                    },
                  },
                },
              },
            ],
          }),
        },
      },
      include: {
        trip: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                photo: true,
              },
            },
            stops: {
              include: {
                city: true,
              },
              orderBy: {
                order: "asc",
              },
              take: 3,
            },
          },
        },
      },
      orderBy: {
        [sortField]: order === "asc" ? "asc" : "desc",
      },
      take: Number(take),
    });

    return sendSuccess(res, 200, posts);
  } catch (error) {
    console.error("[getCommunityFeed] Error:", error);
    return sendError(res, 500, "Internal server error.");
  }
};

export const getCommunityTrip = async (req, res) => {
  try {
    const { tripId } = req.params;

    const post = await prisma.communityPost.update({
      where: {
        tripId,
      },
      data: {
        views: {
          increment: 1,
        },
      },
      include: {
        trip: {
          include: publicTripInclude,
        },
      },
    });

    if (!post.trip.isPublic) {
      return sendError(res, 404, "Public trip not found.");
    }

    return sendSuccess(res, 200, post);
  } catch (error) {
    console.error("[getCommunityTrip] Error:", error);

    if (error.code === "P2025") {
      return sendError(res, 404, "Public trip not found.");
    }

    return sendError(res, 500, "Internal server error.");
  }
};

export const likeCommunityTrip = async (req, res) => {
  try {
    const { tripId } = req.params;

    const post = await prisma.communityPost.update({
      where: {
        tripId,
      },
      data: {
        likes: {
          increment: 1,
        },
      },
    });

    return sendSuccess(res, 200, post, "Trip liked.");
  } catch (error) {
    console.error("[likeCommunityTrip] Error:", error);

    if (error.code === "P2025") {
      return sendError(res, 404, "Public trip not found.");
    }

    return sendError(res, 500, "Internal server error.");
  }
};
