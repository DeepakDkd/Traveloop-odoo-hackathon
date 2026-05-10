import { z } from "zod";

const optionalString = z.string().trim().optional();
const optionalNullableString = z.string().trim().nullable().optional();
const idParam = z.string().trim().min(1);
const dateValue = z.coerce.date();
const activityCategories = [
  "SIGHTSEEING",
  "FOOD",
  "ADVENTURE",
  "CULTURE",
  "SHOPPING",
  "TRANSPORT",
  "OTHER",
];
const expenseCategories = ["TRANSPORT", "STAY", "ACTIVITY", "MEAL", "OTHER"];

export const tripParamSchema = z.object({
  params: z.object({
    tripId: idParam,
  }),
  body: z.any().optional(),
  query: z.any().optional(),
});

export const createStopSchema = z.object({
  params: z.object({
    tripId: idParam,
  }),
  body: z.object({
    cityId: idParam,
    startDate: dateValue,
    endDate: dateValue,
    order: z.coerce.number().int().min(0).optional(),
    note: optionalNullableString,
    notes: optionalNullableString,
  }),
  query: z.any().optional(),
});

export const updateStopSchema = z.object({
  params: z.object({
    stopId: idParam,
  }),
  body: z.object({
    cityId: idParam.optional(),
    startDate: dateValue.optional(),
    endDate: dateValue.optional(),
    order: z.coerce.number().int().min(0).optional(),
  }),
  query: z.any().optional(),
});

export const reorderStopsSchema = z.object({
  params: z.object({
    tripId: idParam,
  }),
  body: z.object({
    stops: z
      .array(
        z.object({
          stopId: idParam,
          order: z.coerce.number().int().min(0),
        })
      )
      .min(1),
  }),
  query: z.any().optional(),
});

export const activitySearchSchema = z.object({
  params: z.any().optional(),
  body: z.any().optional(),
  query: z.object({
    q: optionalString,
    cityId: optionalString,
    category: z.enum(activityCategories).optional(),
    take: z.coerce.number().int().min(1).max(50).optional(),
  }),
});

export const cityActivitiesSchema = z.object({
  params: z.object({
    cityId: idParam,
  }),
  body: z.any().optional(),
  query: z.object({
    category: z.enum(activityCategories).optional(),
    take: z.coerce.number().int().min(1).max(50).optional(),
  }),
});

export const stopActivitySchema = z.object({
  params: z.object({
    stopId: idParam,
  }),
  body: z.object({
    activityId: optionalString,
    name: optionalString,
    description: optionalNullableString,
    category: z.enum(activityCategories).optional(),
    cost: z.coerce.number().min(0).nullable().optional(),
    duration: z.coerce.number().int().min(0).nullable().optional(),
    imageUrl: optionalNullableString,
    scheduledAt: dateValue.nullable().optional(),
    notes: optionalNullableString,
  }),
  query: z.any().optional(),
});

export const removeStopActivitySchema = z.object({
  params: z.object({
    stopId: idParam,
    activityId: idParam,
  }),
  body: z.any().optional(),
  query: z.any().optional(),
});

export const budgetSchema = z.object({
  params: z.object({
    tripId: idParam,
  }),
  body: z.object({
    totalBudget: z.coerce.number().min(0),
    transportBudget: z.coerce.number().min(0).optional(),
    stayBudget: z.coerce.number().min(0).optional(),
    activityBudget: z.coerce.number().min(0).optional(),
    mealBudget: z.coerce.number().min(0).optional(),
    otherBudget: z.coerce.number().min(0).optional(),
    currency: optionalString,
  }),
  query: z.any().optional(),
});

export const updateBudgetSchema = budgetSchema.extend({
  body: budgetSchema.shape.body.partial(),
});

const expenseBodySchema = z.object({
  stopId: optionalNullableString,
  invoiceNumber: optionalNullableString,
  category: z.enum(expenseCategories),
  description: optionalString,
  title: optionalString,
  note: optionalString,
  amount: z.coerce.number().min(0).optional(),
  quantity: z.coerce.number().int().min(1).optional(),
  unitCost: z.coerce.number().min(0).optional(),
  taxPercent: z.coerce.number().min(0).optional(),
  discount: z.coerce.number().min(0).optional(),
  isPaid: z.boolean().optional(),
});

export const createExpenseSchema = z.object({
  params: z.object({
    tripId: idParam,
  }),
  body: expenseBodySchema
    .refine((body) => body.description || body.title, {
      message: "description or title is required.",
    })
    .refine((body) => body.unitCost !== undefined || body.amount !== undefined, {
      message: "unitCost or amount is required.",
    }),
  query: z.any().optional(),
});

export const updateExpenseSchema = z.object({
  params: z.object({
    expenseId: idParam,
  }),
  body: expenseBodySchema.partial(),
  query: z.any().optional(),
});

export const expenseListSchema = z.object({
  params: z.object({
    tripId: idParam,
  }),
  body: z.any().optional(),
  query: z.object({
    q: optionalString,
    category: z.enum(expenseCategories).optional(),
    isPaid: z
      .enum(["true", "false"])
      .transform((value) => value === "true")
      .optional(),
    sort: z.enum(["createdAt", "category", "description", "grandTotal", "isPaid"]).optional(),
    order: z.enum(["asc", "desc"]).optional(),
  }),
});

export const publishCommunitySchema = z.object({
  params: z.object({
    tripId: idParam,
  }),
  body: z.object({
    caption: optionalNullableString,
  }),
  query: z.any().optional(),
});

export const communityTripSchema = z.object({
  params: z.object({
    tripId: idParam,
  }),
  body: z.any().optional(),
  query: z.any().optional(),
});

export const citySearchSchema = z.object({
  params: z.any().optional(),
  body: z.any().optional(),
  query: z.object({
    q: optionalString,
    country: optionalString,
    take: z.coerce.number().int().min(1).max(50).optional(),
  }),
});

export const cityParamSchema = z.object({
  params: z.object({
    cityId: idParam,
  }),
  body: z.any().optional(),
  query: z.any().optional(),
});

export const updateProfileSchema = z.object({
  params: z.any().optional(),
  body: z.object({
    firstName: optionalNullableString,
    lastName: optionalNullableString,
    phone: optionalNullableString,
    language: optionalNullableString,
    city: optionalNullableString,
    country: optionalNullableString,
    addInfo: optionalNullableString,
  }),
  query: z.any().optional(),
});

export const shareTokenSchema = z.object({
  params: z.object({
    shareToken: idParam,
  }),
  body: z.any().optional(),
  query: z.any().optional(),
});
