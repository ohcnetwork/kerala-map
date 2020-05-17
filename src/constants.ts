export const MAP = {
  ACCESS_TOKEN: process.env.POI_APP_MAPBOX_ACCESS_TOKEN,
  MAX_ZOOM: 11.824974653320604,
  LINE: {
    DISTRICT: { DARK: "#ffffff", LIGHT: "#D2D5D5" },
    LSGD: { DARK: "#D2D5D5", LIGHT: "#BDC0C0" },
  },
  MAXBOUNDS: [
    [71.05, 8.12],
    [81.1, 12.95],
  ],
  BASEMAP: {
    DARK: "mapbox://styles/saanu09xs/ck9vk938f10811irwhfr1gn4c",
    LIGHT: "mapbox://styles/saanu09xs/ck9w8haky07k91is3pn3dmlxj",
  },
};

export const CARE = {
  USERNAME: process.env.POI_APP_CARE_USERNAME,
  PASSWORD: process.env.POI_APP_CARE_PASSWORD,
};

export const ZONE = {
  COLOR: {
    CONTAINMENT: "#3182CE",
    RED: "#E53E3E",
    ORANGE: "#DD6B20",
    GREEN: "#38A169",
  },
  COLOR_TEXT: {
    CONTAINMENT: "text-blue-600",
    RED: "text-red-600",
    ORANGE: "text-orange-600",
    GREEN: "text-green-600",
  },
  HEIGHT_MULTIPLIER: 2,
};

export const STATS = {
  COLOR: {
    ACTIVE: "#E53E3E",
    CONFIRMED: "#D69E2E",
    DEATH: "#718096",
    RECOVERED: "#38A169",
  },
  COLOR_TEXT: {
    ACTIVE: "text-red-600",
    CONFIRMED: "text-yellow-600",
    DEATH: "text-gray-600",
    RECOVERED: "text-green-600",
  },
  HEIGHT_MULTIPLIER: 40000,
};

export const MODE = {
  STATS_ACTIVE: 0,
  STATS_DEATH: 1,
  STATS_RECOVERED: 2,
  STATS_CONFIRMED: 3,
  HOTSPOTS_LSGD: 4,
  HOTSPOTS_DISTRICT: 5,
  CARE_ICU: 6,
  CARE_VENTILATOR: 7,
};

export const MODE_LANG = [
  [MODE.STATS_ACTIVE, "Shows active cases."],
  [MODE.STATS_DEATH, "Shows deceased cases."],
  [MODE.STATS_RECOVERED, "Shows recovered cases."],
  [MODE.STATS_CONFIRMED, "Shows confirmed cases."],
  [MODE.HOTSPOTS_LSGD, "Shows hotspots and LSGD zones."],
  [MODE.HOTSPOTS_DISTRICT, "Shows district zones."],
  [MODE.CARE_ICU, "ICU capacity in hospitals."],
  [MODE.CARE_VENTILATOR, "Ventilators capacity in hospitals."],
];
