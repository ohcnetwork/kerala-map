export const MAP = {
  ACCESS_TOKEN: process.env.POI_APP_MAPBOX_ACCESS_TOKEN,
  MAX_ZOOM: 11.824974653320604,
  LINE: {
    DISTRICT: { DARK: "#484A4A", LIGHT: "#FFFFFF" },
    LSGD: { DARK: "#5F6060", LIGHT: "#FFFFFF" },
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

export const ZONE = {
  COLOR: {
    CONTAINMENT: "#c21313",
  },
  COLOR_TEXT: {
    CONTAINMENT: "text-red-700",
  },
  HEIGHT_MULTIPLIER: 2,
};

export const STATS = {
  COLOR: {
    ACTIVE: "#E53E3E",
    CONFIRMED: "#D69E2E",
    DEATH: "#718096",
    RECOVERED: "#38A169",
    TOTAL_OBS: "#D69E2E",
    HOS_OBS: "#D69E2E",
    HOME_OBS: "#D69E2E",
    HOS_TODAY: "#D69E2E",
  },
  COLOR_TEXT: {
    ACTIVE: "text-red-600",
    CONFIRMED: "text-yellow-600",
    DEATH: "text-gray-600",
    RECOVERED: "text-green-600",
    TOTAL_OBS: "text-yellow-600",
    HOS_OBS: "text-yellow-600",
    HOME_OBS: "text-yellow-600",
    HOS_TODAY: "text-yellow-600",
  },
  LANG: {
    confirmed: "Confirmed",
    active: "Active",
    recovered: "Recovered",
    deceased: "Deaths",
    total_obs: "Under Observation",
    hospital_obs: "Hospital Isolation",
    home_obs: "Home Isolation",
    hospital_today: "Hospitalized Today",
  },
  HEIGHT_MULTIPLIER: 40000,
};

export const MODE = {
  STATS_ACTIVE: 0,
  STATS_DEATH: 1,
  STATS_RECOVERED: 2,
  STATS_TOTAL_OBS: 3,
  STATS_HOSOBS: 4,
  STATS_HOME_OBS: 5,
  STATS_HOSTODAY: 6,
  STATS_CONFIRMED: 7,
  CONTAINMENT: 8,
};

export const MODE_BUTTON = [
  [MODE.STATS_ACTIVE, "ACTIVE"],
  [MODE.STATS_DEATH, "DEATH"],
  [MODE.STATS_RECOVERED, "RECOVERED"],
  [MODE.STATS_TOTAL_OBS, "TOTAL OBSERVATION"],
  [MODE.STATS_HOSOBS, "HOSPITAL OBSERVATION"],
  [MODE.STATS_HOME_OBS, "HOME OBSERVATION"],
  [MODE.STATS_HOSTODAY, "HOSPITALIZED TODAY"],
  [MODE.STATS_CONFIRMED, "CONFIRMED"],
  [MODE.CONTAINMENT, "CONTAINMENT"],
];

export const MODE_LANG = [
  [MODE.STATS_ACTIVE, "Shows active cases."],
  [MODE.STATS_DEATH, "Shows deceased cases."],
  [MODE.STATS_RECOVERED, "Shows recovered cases."],
  [MODE.STATS_TOTAL_OBS, "Shows total people in observation."],
  [MODE.STATS_HOSOBS, "Shows total people in hospitals observation."],
  [MODE.STATS_HOME_OBS, "Shows total people in home observation."],
  [MODE.STATS_HOSTODAY, "Shows people hospitalized today."],
  [MODE.STATS_CONFIRMED, "Shows confirmed cases."],
  [MODE.CONTAINMENT, "Shows containment zones."],
];

export const MODE_SUBHEADER_LANG = [
  [MODE.STATS_ACTIVE, "ACTIVE CASES"],
  [MODE.STATS_DEATH, "DECEASED CASES"],
  [MODE.STATS_RECOVERED, "RECOVERED CASES"],
  [MODE.STATS_TOTAL_OBS, "TOTAL OBSERVATION"],
  [MODE.STATS_HOSOBS, "HOSPITAL OBSERVATION"],
  [MODE.STATS_HOME_OBS, "HOME OBSERVATION"],
  [MODE.STATS_HOSTODAY, "HOSPITALIZED TODAY"],
  [MODE.STATS_CONFIRMED, "CONFIRMED CASES"],
  [MODE.CONTAINMENT, "CONTAINMENT ZONES"],
];

export const MODE_DEFAULT = MODE.CONTAINMENT;

export const DISTRICTS = [
  "Thiruvananthapuram",
  "Kollam",
  "Pathanamthitta",
  "Alappuzha",
  "Kottayam",
  "Idukki",
  "Ernakulam",
  "Thrissur",
  "Palakkad",
  "Malappuram",
  "Kozhikode",
  "Wayanad",
  "Kannur",
  "Kasaragod",
];
