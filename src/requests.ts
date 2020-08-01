import axios from "axios";
import geobuf from "geobuf";
import Pbf from "pbf";

const API_BASE_URL = process.env.POI_APP_API_BASE_URL || "";

export async function getKeralaStats() {
  try {
    let res = await axios.get(
      "https://keralastats.coronasafe.live/latest.json"
    );
    let latest = res.data.summary;
    res = await axios.get("https://keralastats.coronasafe.live/summary.json");
    let summary = res.data.summary;
    let lastUpdated = res.data.last_updated;
    res = await axios.get("https://keralastats.coronasafe.live/hotspots.json");
    let hotspots = res.data.hotspots;
    return { latest, summary, hotspots, lastUpdated };
  } catch (error) {
    throw error;
  }
}

export async function getDescriptions() {
  try {
    let { data } = await axios.get(API_BASE_URL + "/api/description");
    return data.data;
  } catch (error) {
    throw error;
  }
}

export async function getFeatures() {
  try {
    let { data } = await axios.get(API_BASE_URL + "/api/feature");
    return data.data.map((item) => ({
      ...JSON.parse(item.data),
      properties: { FEATURE_ID: item.ID, FEATURE_DESC: item.description },
    }));
  } catch (error) {
    throw error;
  }
}

export async function login(data) {
  try {
    let res = await axios.post(API_BASE_URL + "/api/auth/login", data);
    return res.data;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      throw "Wrong Credentials";
    }
    throw error;
  }
}

export async function createDescription(data, token) {
  try {
    let res = await axios.post(API_BASE_URL + "/api/description", data, {
      headers: {
        Authorization: "Bearer " + token,
      },
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function updateDescription(id, data, token) {
  try {
    let res = await axios.patch(API_BASE_URL + "/api/description/" + id, data, {
      headers: {
        Authorization: "Bearer " + token,
      },
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function deleteDescription(id, token) {
  try {
    let res = await axios.delete(API_BASE_URL + "/api/description/" + id, {
      headers: {
        Authorization: "Bearer " + token,
      },
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function createFeature(data, token) {
  try {
    let res = await axios.post(API_BASE_URL + "/api/feature", data, {
      headers: {
        Authorization: "Bearer " + token,
      },
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function updateFeature(id, data, token) {
  try {
    let res = await axios.patch(API_BASE_URL + "/api/feature/" + id, data, {
      headers: {
        Authorization: "Bearer " + token,
      },
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function deleteFeature(id, token) {
  try {
    let res = await axios.delete(API_BASE_URL + "/api/feature/" + id, {
      headers: {
        Authorization: "Bearer " + token,
      },
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function getGeoJSONs() {
  try {
    let res = await axios.get("/kerala_lsgd.pbf", {
      responseType: "arraybuffer",
    });
    const lsgd = geobuf.decode(new Pbf(res.data));
    res = await axios.get("/kerala_district.pbf", {
      responseType: "arraybuffer",
    });
    const district = geobuf.decode(new Pbf(res.data));
    return { lsgd, district };
  } catch (error) {
    throw error;
  }
}
