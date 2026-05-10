const GEOAPIFY_KEY = "458a639d9c464ddea7aa44dc003d3ccd";

type CategoryMeta = {
  [key: string]: [string, string, string];
};

const CATEGORY_META: CategoryMeta = {
  "entertainment.museum": ["🏛️", "Museum", "#6c5ce7"],
  "tourism.sights": ["🏰", "Landmark", "#e17055"],
  "tourism.attraction": ["🎯", "Attraction", "#fd79a8"],
  "leisure.park": ["🌳", "Park", "#00b894"],
  natural: ["🌿", "Nature", "#55efc4"],
  "natural.water": ["💧", "Lake / River", "#74b9ff"],
  "natural.forest": ["🌲", "Forest", "#00cec9"],
  heritage: ["🏺", "Heritage", "#fdcb6e"],
};

type PlaceResult = {
  name: string;
  icon: string;
  label: string;
  color: string;
  trending: boolean;
  address: string;
  opening_hours: string;
  website: string;
  wikipedia: string;
  phone: string;
  lat: number;
  lon: number;
};

type GeoResult = {
  lat: number;
  lon: number;
  name: string;
};

function getCategoryMeta(categories: string[] = []): [string, string, string] {
  for (const cat of categories) {
    if (cat in CATEGORY_META) {
      return CATEGORY_META[cat];
    }
  }

  return ["📍", "Point of Interest", "#dfe6e9"];
}

function wikiUrl(wikiTag: string): string {
  if (!wikiTag) return "";

  if (wikiTag.startsWith("http")) return wikiTag;

  if (wikiTag.includes(":")) {
    const [lang, title] = wikiTag.split(":");
    return `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(title)}`;
  }

  return `https://en.wikipedia.org/wiki/${encodeURIComponent(wikiTag)}`;
}

async function geocodePlace(place: string): Promise<GeoResult | null> {
  const params = new URLSearchParams({
    text: place,
    limit: "1",
    apiKey: GEOAPIFY_KEY,
  });

  const response = await fetch(
    `https://api.geoapify.com/v1/geocode/search?${params.toString()}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to geocode place");
  }

  const data = await response.json();
  const features = data.features ?? [];

  if (!features.length) return null;

  const feature = features[0];

  return {
    lat: feature.geometry.coordinates[1],
    lon: feature.geometry.coordinates[0],
    name:
      feature.properties.city ||
      feature.properties.name ||
      place,
  };
}

type GeoapifyFeature = {
  geometry: {
    coordinates: [number, number];
  };
  properties: {
    name?: string;
    formatted?: string;
    address_line2?: string;
    categories?: string[];
    datasource?: {
      raw?: {
        wikipedia?: string;
        opening_hours?: string;
        website?: string;
        phone?: string;
        "contact:phone"?: string;
      };
    };
  };
};

async function searchPlaces(lat: number, lon: number): Promise<PlaceResult[]> {
  const params = new URLSearchParams({
    categories:
      "tourism.sights,tourism.attraction,entertainment.museum,leisure.park,natural,heritage",
    filter: `circle:${lon},${lat},15000`,
    limit: "60",
    apiKey: GEOAPIFY_KEY,
    lang: "en",
  });

  const response = await fetch(
    `https://api.geoapify.com/v2/places?${params.toString()}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to search places");
  }

  const data = await response.json();

  return (data.features ?? []).map((feat: GeoapifyFeature) => {
    const props = feat.properties || {};

    const raw = props.datasource?.raw || {};

    const categories = props.categories || [];

    const [icon, label, color] =
      getCategoryMeta(categories);

    return {
      name: props.name,
      icon,
      label,
      color,
      trending:
        !!raw.wikipedia || !!raw.opening_hours,
      address:
        props.formatted ||
        props.address_line2 ||
        "",
      opening_hours: raw.opening_hours || "",
      website: raw.website || "",
      wikipedia: wikiUrl(raw.wikipedia || ""),
      phone:
        raw.phone ||
        raw["contact:phone"] ||
        "",
      lat: feat.geometry.coordinates[1],
      lon: feat.geometry.coordinates[0],
    };
  });
}

export async function POST(req: Request) {
  try {
    if (!GEOAPIFY_KEY) {
      return Response.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    const body = await req.json();

    const { place } = body;

    if (!place || typeof place !== "string") {
      return Response.json(
        { error: "Place is required and must be a string" },
        { status: 400 }
      );
    }

    const geo = await geocodePlace(place);

    if (!geo) {
      return Response.json(
        { error: "Place not found" },
        { status: 404 }
      );
    }

    const places = await searchPlaces(
      geo.lat,
      geo.lon
    );

    const trending = places.filter(
      (p) => p.trending
    );

    return Response.json({
      placeName: geo.name,
      places,
      trending,
    });
  } catch (error) {
    console.error("API Error:", error);

    return Response.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
