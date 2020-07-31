import MapGL, {
  Filter,
  GeolocateControl,
  Image,
  Layer,
  Source,
} from "@urbica/react-map-gl";
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { MAP, MODE, STATS, ZONE } from "../constants";
import { GeoContext } from "../context/GeoContext";
import { HoveredContext } from "../context/HoveredContext";
import { ModeContext } from "../context/ModeContext";
import { ThemeContext } from "../context/ThemeContext";
import Card from "./Card";

export default function MapBox({ stats, zones, geoJSONs, descriptions }) {
  const lsgd = useMemo(() => {
    let _lsgd = geoJSONs.lsgd;
    _lsgd.features = _lsgd.features.map((f) => {
      f.properties = {
        ...f.properties,
        CONTAINMENT: 0,
        ALERT: "",
        WARDS: "",
        ALERT_ID: 0,
      };
      for (const h of zones.hotspots) {
        if (
          h.lsgd === f.properties.LSGD &&
          h.district === f.properties.DISTRICT
        ) {
          f.properties = { ...f.properties, CONTAINMENT: 1, WARDS: h.wards };
        }
      }
      for (const d of descriptions) {
        if (
          d.lsgd === f.properties.LSGD &&
          d.district === f.properties.DISTRICT
        ) {
          f.properties = { ...f.properties, ALERT: d.data, ALERT_ID: d.ID };
        }
      }
      return f;
    });
    return _lsgd;
  }, [zones.hotspots, descriptions]);

  const { dark } = useContext(ThemeContext);
  const { geolocatedLoc, setGeolocatedLoc } = useContext(GeoContext);
  const { hoveredEntity, setHoveredEntity } = useContext(HoveredContext);
  const mapRef = useRef(null);
  const { mode } = useContext(ModeContext);
  const [clicked, setClicked] = useState(false);
  const [viewport, setViewport] = useState({
    latitude: (MAP.MAXBOUNDS[0][1] + MAP.MAXBOUNDS[1][1]) / 2,
    longitude: (MAP.MAXBOUNDS[0][0] + MAP.MAXBOUNDS[1][0]) / 2,
    zoom: MAP.INIT_ZOOM,
  });
  const [statsMax, setStatsMax] = useState({
    active: 0,
    confirmed: 0,
    deceased: 0,
    recovered: 0,
    total_obs: 0,
    hospital_obs: 0,
    home_obs: 0,
    hospital_today: 0,
  });

  useEffect(() => {
    const map = mapRef.current.getMap();
    let src = map.getSource("lsgd");
    if (map.getSource("lsgd")) {
      map.getSource("lsgd").setData(lsgd);
    }
  }, [zones.hotspots, descriptions]);

  useEffect(() => {
    if (geolocatedLoc == null) {
      const map = mapRef.current.getMap();
      map.fitBounds(MAP.MAXBOUNDS);
      let e = document.querySelector(".mapboxgl-user-location-dot");
      e && e.remove();
      e = document.querySelector(".mapboxgl-user-location-accuracy-circle");
      e && e.remove();
    }
  }, [geolocatedLoc]);

  useEffect(() => {
    let active = 0;
    let confirmed = 0;
    let deceased = 0;
    let recovered = 0;
    let total_obs = 0;
    let hospital_obs = 0;
    let home_obs = 0;
    let hospital_today = 0;
    Object.keys(stats.latest).forEach((d) => {
      active = Math.max(active, stats.latest[d].active);
      confirmed = Math.max(confirmed, stats.latest[d].confirmed);
      deceased = Math.max(deceased, stats.latest[d].deceased);
      recovered = Math.max(recovered, stats.latest[d].recovered);
      total_obs = Math.max(total_obs, stats.latest[d].total_obs);
      hospital_obs = Math.max(hospital_obs, stats.latest[d].hospital_obs);
      home_obs = Math.max(home_obs, stats.latest[d].home_obs);
      hospital_today = Math.max(hospital_today, stats.latest[d].hospital_today);
    });
    setStatsMax({
      active: active,
      confirmed: confirmed,
      deceased: deceased,
      recovered: recovered,
      total_obs: total_obs,
      hospital_obs: hospital_obs,
      home_obs: home_obs,
      hospital_today: hospital_today,
    });
  }, []);

  const hotspotActive = (event) => {
    let f = event.features[0];
    if (f.properties.DISTRICT == "") {
      return;
    }
    if (
      hoveredEntity === null ||
      (hoveredEntity && hoveredEntity.id !== f.id)
    ) {
      setHoveredEntity({
        id: f.id,
        p: f.properties,
      });
    }
  };

  const statsActive = (event) => {
    let f = event.features[0];
    if (
      hoveredEntity === null ||
      (hoveredEntity && hoveredEntity.id !== f.properties.FID)
    ) {
      setHoveredEntity({
        id: f.properties.FID,
        p: f.properties,
      });
    }
  };

  const _setHoveredEntity = (event) => {
    if (mode <= MODE.STATS_CONFIRMED) {
      statsActive(event);
    } else {
      hotspotActive(event);
    }
  };

  const onClick = (event) => {
    if (event.features && event.features.length > 0) {
      _setHoveredEntity(event);
      setClicked(true);
    } else {
      setClicked(false);
      setHoveredEntity(null);
    }
  };

  const onHover = (event) => {
    if (event.features && event.features.length > 0 && !clicked) {
      _setHoveredEntity(event);
    }
  };

  const onLeave = () => {
    if (hoveredEntity && !clicked) {
      setHoveredEntity(null);
    }
  };

  const onGeolocate = (data) => {
    if (mapRef) {
      const map = mapRef.current.getMap();
      const p = data.target._userLocationDotMarker._pos;
      let _f = map.queryRenderedFeatures([p.x, p.y]);
      if (!_f) {
        return;
      }
      const f = _f.find((e) => e.layer.id === "lsgd-hot");
      if (!f) {
        return;
      }
      setGeolocatedLoc({
        p: f.properties,
        z: "CONTAINMENT",
      });
    }
  };

  const onError = (error) => {
    console.error("A geolocate event has occurred.", error);
  };

  const GenLL = (s: string, label = true) => {
    return (
      <div>
        <Layer
          id={`${s}-line`}
          before={s == "district" ? "lsgd-label" : "district-label"}
          type="line"
          source={s}
          paint={{
            "line-color": dark ? MAP.LINE.DARK : MAP.LINE.LIGHT,
            "line-width": [
              "interpolate",
              ["cubic-bezier", 0.68, 0.03, 0.2, 0.72],
              ["zoom"],
              MAP.INIT_ZOOM,
              s === "district" ? 1 : 0.1,
              MAP.MAX_ZOOM,
              s === "district" ? 5 : 1,
            ],
            "line-translate-anchor": "viewport",
          }}
        />
        {label && (
          <Layer
            id={`${s}-label`}
            type="symbol"
            source={s}
            paint={{
              "text-color": dark ? "white" : "black",
              "text-translate-anchor": "viewport",
              "text-opacity": ["step", ["zoom"], s == "district" ? 1 : 0, 9, 1],
            }}
            layout={{
              "text-field": ["get", s.toUpperCase()],
              "text-size": s == "district" ? 12 : 10,
              "text-variable-anchor": ["center"],
              "text-justify": "auto",
            }}
          />
        )}
      </div>
    );
  };

  const statsInterpolate = (key: string) => {
    let a = 0;
    let c = "";
    let k = null;
    if (mode === MODE.STATS_ACTIVE) {
      Object.keys(stats.latest).forEach(
        (d) => (a = Math.max(a, stats.latest[d].active))
      );
      c = STATS.COLOR.ACTIVE;
      k = stats.latest[key].active;
    } else if (mode === MODE.STATS_CONFIRMED) {
      Object.keys(stats.latest).forEach(
        (d) => (a = Math.max(a, stats.latest[d].confirmed))
      );
      c = STATS.COLOR.CONFIRMED;
      k = stats.latest[key].confirmed;
    } else if (mode === MODE.STATS_DEATH) {
      Object.keys(stats.latest).forEach(
        (d) => (a = Math.max(a, stats.latest[d].deceased))
      );
      c = STATS.COLOR.DEATH;
      k = stats.latest[key].deceased;
    } else if (mode === MODE.STATS_RECOVERED) {
      Object.keys(stats.latest).forEach(
        (d) => (a = Math.max(a, stats.latest[d].recovered))
      );
      c = STATS.COLOR.RECOVERED;
      k = stats.latest[key].recovered;
    } else if (mode === MODE.STATS_TOTAL_OBS) {
      Object.keys(stats.latest).forEach(
        (d) => (a = Math.max(a, stats.latest[d].total_obs))
      );
      c = STATS.COLOR.TOTAL_OBS;
      k = stats.latest[key].total_obs;
    } else if (mode === MODE.STATS_HOSOBS) {
      Object.keys(stats.latest).forEach(
        (d) => (a = Math.max(a, stats.latest[d].hospital_obs))
      );
      c = STATS.COLOR.HOS_OBS;
      k = stats.latest[key].hospital_obs;
    } else if (mode === MODE.STATS_HOME_OBS) {
      Object.keys(stats.latest).forEach(
        (d) => (a = Math.max(a, stats.latest[d].home_obs))
      );
      c = STATS.COLOR.HOME_OBS;
      k = stats.latest[key].home_obs;
    } else if (mode === MODE.STATS_HOSTODAY) {
      Object.keys(stats.latest).forEach(
        (d) => (a = Math.max(a, stats.latest[d].hospital_today))
      );
      c = STATS.COLOR.HOS_TODAY;
      k = stats.latest[key].hospital_today;
    }
    return ["interpolate", ["linear"], k, 0, dark ? "white" : "black", a, c];
  };

  const statsHeight = (key: string) => {
    let k = 0;
    if (mode === MODE.STATS_ACTIVE) {
      k = stats.latest[key].active / statsMax.active;
    } else if (mode === MODE.STATS_CONFIRMED) {
      k = stats.latest[key].confirmed / statsMax.confirmed;
    } else if (mode === MODE.STATS_DEATH) {
      k = stats.latest[key].deceased / statsMax.deceased;
    } else if (mode === MODE.STATS_RECOVERED) {
      k = stats.latest[key].recovered / statsMax.recovered;
    } else if (mode === MODE.STATS_TOTAL_OBS) {
      k = stats.latest[key].total_obs / statsMax.total_obs;
    } else if (mode === MODE.STATS_HOSOBS) {
      k = stats.latest[key].hospital_obs / statsMax.hospital_obs;
    } else if (mode === MODE.STATS_HOME_OBS) {
      k = stats.latest[key].home_obs / statsMax.home_obs;
    } else if (mode === MODE.STATS_HOSTODAY) {
      k = stats.latest[key].hospital_today / statsMax.hospital_today;
    }
    return k * STATS.HEIGHT_MULTIPLIER;
  };

  return (
    <div className="flex flex-col min-w-full min-h-full lg:flex-row">
      <Card zones={zones} stats={stats} />
      <div
        className="flex flex-grow w-full lg:w-5/6"
        style={{ minHeight: "90vh" }}
      >
        <MapGL
          style={{ width: "100%", ZAxis: "0" }}
          mapStyle={dark ? MAP.BASEMAP.DARK : MAP.BASEMAP.LIGHT}
          accessToken={MAP.ACCESS_TOKEN}
          onViewportChange={setViewport}
          maxBounds={MAP.MAXBOUNDS}
          maxZoom={MAP.MAX_ZOOM}
          onClick={onClick}
          viewportChangeMethod="flyTo"
          viewportChangeOptions={{ duration: 1000 }}
          {...viewport}
          ref={mapRef}
        >
          <Source id="district" type="geojson" data={geoJSONs.district} />
          <Source id="lsgd" type="geojson" data={lsgd} />
          <Image
            id="all-ward"
            image={dark ? "/alert_black.png" : "/alert_white.png"}
          />
          {mode === MODE.CONTAINMENT && (
            <div>
              <GeolocateControl
                positionOptions={{ enableHighAccuracy: true, timeout: 1000 }}
                position="bottom-right"
                onGeolocate={onGeolocate}
                onError={onError}
              />
              <Layer
                id="lsgd-hot-desc"
                type="fill"
                source="lsgd"
                paint={{
                  "fill-color": [
                    "case",
                    [
                      "all",
                      ["==", ["get", "CONTAINMENT"], 1],
                      ["!=", ["get", "ALERT_ID"], 0],
                    ],
                    ZONE.COLOR_MARKED_HOT,
                    [
                      "all",
                      ["==", ["get", "CONTAINMENT"], 1],
                      ["==", ["get", "ALERT_ID"], 0],
                    ],
                    ZONE.COLOR,
                    [
                      "all",
                      ["!=", ["get", "CONTAINMENT"], 1],
                      ["!=", ["get", "ALERT_ID"], 0],
                    ],
                    ZONE.COLOR_MARKED,
                    dark ? ZONE.COLOR_NONE_DARK : ZONE.COLOR_NONE_LIGHT,
                  ],
                  "fill-opacity": 0.2,
                }}
                onHover={onHover}
                onLeave={onLeave}
                onClick={onClick}
              />
              <Layer
                before="lsgd-label"
                id="lsgd-hot-all-ward"
                type="symbol"
                source="lsgd"
                layout={{
                  "icon-allow-overlap": true,
                  "icon-image": "all-ward",
                  "icon-size": [
                    "interpolate",
                    ["linear"],
                    ["zoom"],
                    MAP.INIT_ZOOM,
                    0,
                    MAP.MAX_ZOOM,
                    1,
                  ],
                  "icon-keep-upright": true,
                }}
                paint={{
                  "icon-opacity": [
                    "case",
                    [
                      "all",
                      ["==", ["get", "CONTAINMENT"], 1],
                      ["==", ["get", "WARDS"], "All Wards"],
                    ],
                    1,
                    0,
                  ],
                  "icon-translate-anchor": "viewport",
                }}
              />
              {GenLL("lsgd")}
              {GenLL("district")}
            </div>
          )}
          {mode <= MODE.STATS_CONFIRMED && (
            <div>
              {Object.keys(stats.latest).map((key, i) => {
                return (
                  <div key={i}>
                    <Layer
                      id={`zone-district-${key}`}
                      type="fill-extrusion"
                      source="district"
                      paint={{
                        "fill-extrusion-color": statsInterpolate(key),
                        "fill-extrusion-opacity": 0.8,
                        "fill-extrusion-height": statsHeight(key),
                        "fill-extrusion-vertical-gradient": true,
                      }}
                      onHover={onHover}
                      onLeave={onLeave}
                      onClick={onClick}
                    />
                    <Filter
                      layerId={`zone-district-${key}`}
                      filter={["==", "DISTRICT", key]}
                    />
                  </div>
                );
              })}
              {GenLL("district")}
            </div>
          )}
        </MapGL>
      </div>
    </div>
  );
}
