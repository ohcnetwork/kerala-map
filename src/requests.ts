import axios from "axios";

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
    let hotspots = res.data.hotspots.reduce((a, r) => [...a, r.lsgd], []);
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
  } catch (error) {
    throw error;
  }
}

export async function getCareStats(f = false) {
  try {
    const token = localStorage.getItem("care_access_token");
    if (f && token) {
      await careRefreshToken();
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
      let hos = Object.values(res.data);
      const reducer = (a, r) => {
        let _icu = r.availability.find((k) => k.room_type === 10);
        let _ven = r.availability.find((k) => k.room_type === 20);
        if (r.location && (_icu || _ven)) {
          a.push({
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [r.location.longitude, r.location.latitude],
            },
            properties: {
              id: r.id,
              name: r.name,
              address: r.address,
              district:
                r.district_object.name === "Kasargode"
                  ? "Kasaragod"
                  : r.district_object.name,
              phoneNo: r.phone_number,
              type: r.facility_type,
              icu_current: _icu ? _icu.current_capacity : 0,
              icu_total: _icu ? _icu.total_capacity : 0,
              ventilator_current: _ven ? _ven.current_capacity : 0,
              ventilator_total: _ven ? _ven.total_capacity : 0,
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
