import axios from "axios";
import geobuf from "geobuf";
import Pbf from "pbf";

const API_BASE_URL = process.env.API_BASE_URL || "";

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
    let { data } = await axios.get("/api/description");
    return data.data;
  } catch (error) {
    throw error;
  }
}

export async function login(data) {
  try {
    let res = await axios.post("/api/auth/login", data);
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
