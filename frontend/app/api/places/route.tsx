import axios from "axios";

const GEOAPIFY_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_KEY;

type CategoryMetaEntry = [string, string, string];

const CATEGORY_META: Record<string, CategoryMetaEntry> = {
  "entertainment.museum": ["museum", "Museum", "#6c5ce7"],
  "tourism.sights": ["landmark", "Landmark", "#e17055"],
  "tourism.attraction": ["attraction", "Attraction", "#fd79a8"],
  "tourism.sights.place_of_worship": [
    "worship",
    "Place of Worship",
    "#a29bfe",
  ],
  "leisure.park": ["park", "Park", "#00b894"],
  natural: ["nature", "Nature", "#55efc4"],
  "natural.water": ["water", "Lake / River", "#74b9ff"],
  "natural.forest": ["forest", "Forest", "#00cec9"],
  heritage: ["heritage", "Heritage", "#fdcb6e"],
};

type GeoapifyGeocodeResponse = {
  features?: Array<{
    geometry: {
      coordinates: [number, number];
    };
    properties: {
      city?: string;
      name?: string;
    };
  }>;
};

type GeoapifyPlacesResponse = {
  features?: Array<{
    geometry: {
      coordinates: [number, number];
    };
    properties?: {
      name?: string;
      formatted?: string;
      address_line2?: string;
      categories?: string[];
      datasource?: {
        raw?: Record<string, string>;
      };
    };
  }>;
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

function getCategoryMeta(categories: string[]) {
  for (const category of categories) {
    const meta = CATEGORY_META[category];

    if (meta) {
      return meta;
    }
  }

  return ["place", "Point of Interest", "#dfe6e9"] satisfies CategoryMetaEntry;
}

function wikiUrl(wikiTag: string) {
  if (!wikiTag) {
    return "";
  }

  if (wikiTag.startsWith("http")) {
    return wikiTag;
  }

  if (wikiTag.includes(":")) {
    const [language, title] = wikiTag.split(":");

    return `https://${language}.wikipedia.org/wiki/${encodeURIComponent(title)}`;
  }

  return `https://en.wikipedia.org/wiki/${encodeURIComponent(wikiTag)}`;
}

async function geocodePlace(place: string) {
  const response = await axios.get<GeoapifyGeocodeResponse>(
    "https://api.geoapify.com/v1/geocode/search",
    {
      params: {
        text: place,
        limit: 1,
        apiKey: GEOAPIFY_KEY,
      },
    },
  );

  const features = response.data.features ?? [];

  if (features.length === 0) {
    return null;
  }

  const feature = features[0];

  return {
    lat: feature.geometry.coordinates[1],
    lon: feature.geometry.coordinates[0],
    name: feature.properties.city || feature.properties.name || place,
  };
}

async function searchPlaces(lat: number, lon: number) {
  const response = await axios.get<GeoapifyPlacesResponse>(
    "https://api.geoapify.com/v2/places",
    {
      params: {
        categories:
          "tourism.sights,tourism.attraction,entertainment.museum,leisure.park,natural,heritage,building.tourism",
        filter: `circle:${lon},${lat},15000`,
        limit: 60,
        apiKey: GEOAPIFY_KEY,
        lang: "en",
      },
    },
  );

  const features = response.data.features ?? [];

  return features
    .flatMap((feature) => {
      const properties = feature.properties ?? {};
      const name = properties.name?.trim() ?? "";

      if (!name) {
        return [];
      }

      const raw = properties.datasource?.raw ?? {};
      const categories = properties.categories ?? [];
      const [icon, label, color] = getCategoryMeta(categories);
      const wikipedia = raw.wikipedia || raw.wikidata;

      return [
        {
          name,
          icon,
          label,
          color,
          trending: Boolean(wikipedia || raw.opening_hours),
          address: properties.formatted || properties.address_line2 || "",
          opening_hours: raw.opening_hours || "",
          website: raw.website || "",
          wikipedia: wikiUrl(raw.wikipedia || ""),
          phone: raw.phone || raw["contact:phone"] || "",
          lat: feature.geometry.coordinates[1],
          lon: feature.geometry.coordinates[0],
        },
      ] satisfies PlaceResult[];
    })
    .filter(Boolean);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      place?: string;
    };

    const place = body.place?.trim();

    if (!place) {
      return Response.json(
        {
          error: "Please enter a place name",
        },
        { status: 400 },
      );
    }

    const geo = await geocodePlace(place);

    if (!geo) {
      return Response.json(
        {
          error: "Could not find that place",
        },
        { status: 404 },
      );
    }

    const places = await searchPlaces(geo.lat, geo.lon);
    const trending = places.filter((item) => item.trending);

    return Response.json({
      placeName: geo.name,
      centerLat: geo.lat,
      centerLon: geo.lon,
      allPlaces: places,
      trending,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        error: "Something went wrong",
      },
      { status: 500 },
    );
  }
}
