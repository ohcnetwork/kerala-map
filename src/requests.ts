import axios from "axios";
import geobuf from "geobuf";
import Pbf from "pbf";

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
    res = await axios.get("https://keralastats.coronasafe.live/zones.json");
    let districts = res.data.districts;
    return { latest, summary, hotspots, districts, lastUpdated };
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
