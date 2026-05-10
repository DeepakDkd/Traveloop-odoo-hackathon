import axios from "axios";

const GEOAPIFY_KEY =
  process.env.NEXT_PUBLIC_GEOAPIFY_KEY;

const CATEGORY_META = {
  "entertainment.museum": [
    "🏛️",
    "Museum",
    "#6c5ce7",
  ],
  "tourism.sights": [
    "🏰",
    "Landmark",
    "#e17055",
  ],
  "tourism.attraction": [
    "🎯",
    "Attraction",
    "#fd79a8",
  ],
  "tourism.sights.place_of_worship": [
    "⛪",
    "Place of Worship",
    "#a29bfe",
  ],
  "leisure.park": [
    "🌳",
    "Park",
    "#00b894",
  ],
  natural: [
    "🌿",
    "Nature",
    "#55efc4",
  ],
  "natural.water": [
    "💧",
    "Lake / River",
    "#74b9ff",
  ],
  "natural.forest": [
    "🌲",
    "Forest",
    "#00cec9",
  ],
  heritage: [
    "🏺",
    "Heritage",
    "#fdcb6e",
  ],
};

function getCategoryMeta(categories = []) {
  for (const cat of categories) {
    for (const key in CATEGORY_META) {
      if (cat === key) {
        return CATEGORY_META[key];
      }
    }
  }

  return [
    "📍",
    "Point of Interest",
    "#dfe6e9",
  ];
}

function wikiUrl(wikiTag) {
  if (!wikiTag) return "";

  if (wikiTag.startsWith("http")) {
    return wikiTag;
  }

  if (wikiTag.includes(":")) {
    const [lang, title] =
      wikiTag.split(":");

    return `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(
      title
    )}`;
  }

  return `https://en.wikipedia.org/wiki/${encodeURIComponent(
    wikiTag
  )}`;
}

async function geocodePlace(place) {
  const response = await axios.get(
    "https://api.geoapify.com/v1/geocode/search",
    {
      params: {
        text: place,
        limit: 1,
        apiKey: GEOAPIFY_KEY,
      },
    }
  );

  const features =
    response.data.features || [];

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

async function searchPlaces(lat, lon) {
  const response = await axios.get(
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
    }
  );

  const features =
    response.data.features || [];

  return features
    .map((feat) => {
      const props =
        feat.properties || {};

      const name =
        props.name?.trim() || "";

      if (!name) return null;

      const raw =
        props.datasource?.raw || {};

      const categories =
        props.categories || [];

      const [icon, label, color] =
        getCategoryMeta(categories);

      const wikipedia =
        raw.wikipedia || raw.wikidata;

      const trending = Boolean(
        wikipedia || raw.opening_hours
      );

      return {
        name,
        icon,
        label,
        color,
        trending,
        address:
          props.formatted ||
          props.address_line2 ||
          "",

        opening_hours:
          raw.opening_hours || "",

        website: raw.website || "",

        wikipedia: wikiUrl(
          raw.wikipedia || ""
        ),

        phone:
          raw.phone ||
          raw["contact:phone"] ||
          "",

        lat:
          feat.geometry.coordinates[1],

        lon:
          feat.geometry.coordinates[0],
      };
    })
    .filter(Boolean);
}

export async function POST(req) {
  try {
    const body = await req.json();

    const place = body.place?.trim();

    if (!place) {
      return Response.json(
        {
          error:
            "Please enter a place name",
        },
        { status: 400 }
      );
    }

    const geo =
      await geocodePlace(place);

    if (!geo) {
      return Response.json(
        {
          error:
            "Could not find that place",
        },
        { status: 404 }
      );
    }

    const places =
      await searchPlaces(
        geo.lat,
        geo.lon
      );

    const trending =
      places.filter(
        (p) => p.trending
      );

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
        error:
          "Something went wrong",
      },
      { status: 500 }
    );
  }
}