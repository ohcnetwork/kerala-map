import axios from "axios";
import geobuf from "geobuf";
import Pbf from "pbf";
import { Circle } from "terraformer";

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

export async function careLogin(data) {
  try {
    let res = await axios.post(
      "https://care.coronasafe.network/api/v1/auth/login/",
      data
    );
    localStorage.setItem("care_access_token", res.data.access);
    localStorage.setItem("care_refresh_token", res.data.refresh);
  } catch (error) {
    if (error.response && error.response.status === 401) {
      throw "Wrong Credentials";
    }
    throw error;
  }
}

export async function careRefreshToken() {
  try {
    const refresh = localStorage.getItem("care_refresh_token");
    let res = await axios.post(
      "https://care.coronasafe.network/api/v1/auth/token/refresh/",
      {
        refresh,
      }
    );
    localStorage.setItem("care_access_token", res.data.access);
    localStorage.setItem("care_refresh_token", res.data.refresh);
    return true;
  } catch (error) {
    return false;
  }
}

export async function getCareStats(f = false) {
  try {
    let token = localStorage.getItem("care_access_token");
    if (f && token && !(await careRefreshToken())) {
      token = "";
      localStorage.removeItem("care_access_token");
      localStorage.removeItem("care_refresh_token");
    }
    let hospitals = {};
    if (token) {
      let res = await axios.get(
        "https://care.coronasafe.network/api/v1/facility_summary/",
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );
      let hos = res.data.results.filter((item) => item.data.id);
      const reducer = (a, r) => {
        let _icu = r.data.availability.find((k) => k.room_type === 10);
        let _ven = r.data.availability.find((k) => k.room_type === 20);
        let _bed = r.data.availability.find((k) => k.room_type === 1);
        let _room = r.data.availability.find((k) => k.room_type === 3);
        if (r.data.location && (_icu || _ven || _bed || _room)) {
          a.push({
            type: "Feature",
            ...new Circle(
              [r.data.location.longitude, r.data.location.latitude],
              200, //The radius of the circle in meters.
              5 //How many steps will be used to create the polygon that represents the circle. i.e number of poins in the polyon array
            ),
            point: [r.data.location.longitude, r.data.location.latitude],
            properties: {
              id: r.data.id,
              name: r.data.name,
              address: r.data.address,
              district:
                r.data.district_object.name === "Kasargode"
                  ? "Kasaragod"
                  : r.data.district_object.name,
              phoneNo: r.data.phone_number,
              type: r.data.facility_type,
              icu_current: _icu ? _icu.current_capacity : 0,
              icu_total: _icu ? _icu.total_capacity : 0,
              ventilator_current: _ven ? _ven.current_capacity : 0,
              ventilator_total: _ven ? _ven.total_capacity : 0,
              bed_current: _bed ? _bed.current_capacity : 0,
              bed_total: _bed ? _bed.total_capacity : 0,
              room_current: _room ? _room.current_capacity : 0,
              room_total: _room ? _room.total_capacity : 0,
            },
          });
        }
        return a;
      };
      hospitals = {
        type: "FeatureCollection",
        features: hos.reduce(reducer, []),
      };
    }
    return { hospitals };
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
