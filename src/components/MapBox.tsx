import MapGL, {
  Filter,
  GeolocateControl,
  Layer,
  Source,
} from "@urbica/react-map-gl";
import React, { useEffect, useRef, useState } from "react";
import { MAP, MODE, MODE_DEFAULT, STATS, ZONE } from "../constants";
import Card from "./Card";

export default function MapBox({
  dark,
  stats,
  zones,
  care,
  setCare,
  geoJSONs,
}) {
  const mapRef = useRef(null);
  const [mode, setMode] = useState(MODE_DEFAULT);
  const [clicked, setClicked] = useState(false);
  const [hoveredEntity, setHoveredEntity] = useState(null);
  const [geolocatedLoc, setGeolocatedLoc] = useState(null);
  const [viewport, setViewport] = useState({
    latitude: (MAP.MAXBOUNDS[0][1] + MAP.MAXBOUNDS[1][1]) / 2,
    longitude: (MAP.MAXBOUNDS[0][0] + MAP.MAXBOUNDS[1][0]) / 2,
    zoom: 1,
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
    if (
      hoveredEntity === null ||
      (hoveredEntity && hoveredEntity.id !== f.id)
    ) {
      let z = f.layer.id.includes("lsgd-hot")
        ? "CONTAINMENT"
        : zones.districts[f.properties.DISTRICT].toUpperCase();
      setHoveredEntity({
        id: f.id,
        p: f.properties,
        z: z,
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
        z: zones.districts[f.properties.DISTRICT].toUpperCase(),
      });
    }
  };

  const careActive = (event) => {
    let f = event.features[0].properties;
    if (
      hoveredEntity === null ||
      (hoveredEntity && hoveredEntity.id !== f.id)
    ) {
      setHoveredEntity({
        ...f,
      });
    }
  };

  const _setHoveredEntity = (event) => {
    if (mode === MODE.HOTSPOTS_DISTRICT || mode === MODE.HOTSPOTS_LSGD) {
      hotspotActive(event);
    }
    if (
      mode === MODE.CARE_VENTILATOR ||
      mode === MODE.CARE_ICU ||
      mode === MODE.CARE_HOSPITALS
    ) {
      careActive(event);
    }
    if (mode <= MODE.STATS_CONFIRMED) {
      statsActive(event);
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
    const errorMsg = "Could not locate, please try again.";
    if (mapRef) {
      const map = mapRef.current.getMap();
      const p = data.target._userLocationDotMarker._pos;
      let _f = map.queryRenderedFeatures([p.x, p.y]);
      if (!_f) {
        // alert(errorMsg);
        return;
      }
      const f = _f.find((e) => e.layer.type === "fill-extrusion");
      if (!f) {
        // alert(errorMsg);
        return;
      }
      let z =
        f.properties.LSGD && zones.hotspots.includes(f.properties.LSGD)
          ? "CONTAINMENT"
          : zones.districts[f.properties.DISTRICT].toUpperCase();
      setGeolocatedLoc({
        p: f.properties,
        z: z,
      });
    }
  };

  const onError = (error) => {
    console.log("A geolocate event has occurred.", error);
  };

  const zoneHeight = (z) => {
    return (
      ZONE.HEIGHT_MULTIPLIER *
      (z === "GREEN" ? 500 : z === "ORANGE" ? 1500 : z === "RED" ? 3000 : 5000)
    );
  };

  const GenLL = (s: string, label = true) => {
    return (
      <div>
        <Layer
          id={`${s}-line`}
          type="line"
          source={s}
          paint={{
            "line-color": dark
              ? MAP.LINE[s.toUpperCase()].DARK
              : MAP.LINE[s.toUpperCase()].LIGHT,
            "line-width": s === "district" ? 2 : 1,
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
            }}
            layout={{
              "text-field": ["get", s.toUpperCase()],
              "text-size": 10,
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
    <div className="flex flex-col lg:flex-row min-h-full min-w-full">
      <Card
        mode={mode}
        setMode={setMode}
        zones={zones}
        stats={stats}
        care={care}
        hoveredEntity={hoveredEntity}
        dark={dark}
        geolocatedLoc={geolocatedLoc}
        setGeolocatedLoc={setGeolocatedLoc}
        setCare={setCare}
      />
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
          <Source id="lsgd" type="geojson" data={geoJSONs.lsgd} />
          {care.hospitals.features && (
            <Source id="care" type="geojson" data={care.hospitals} />
          )}
          {mode === MODE.HOTSPOTS_LSGD && (
            <div>
              <GeolocateControl
                positionOptions={{ enableHighAccuracy: true, timeout: 1000 }}
                position="bottom-right"
                onGeolocate={onGeolocate}
                onError={onError}
              />
              <Layer
                id="lsgd-hot"
                type="fill-extrusion"
                source="lsgd"
                paint={{
                  "fill-extrusion-color": ZONE.COLOR.CONTAINMENT,
                  "fill-extrusion-opacity": 0.8,
                  "fill-extrusion-height": zoneHeight("CONTAINMENT"),
                }}
                onHover={onHover}
                onLeave={onLeave}
                onClick={onClick}
              />
              <Filter
                layerId="lsgd-hot"
                filter={["in", "LSGD", ...zones.hotspots]}
              />
              {Object.keys(zones.districts).map((key, i) => {
                return (
                  <div key={i}>
                    <Layer
                      id={`lsgd-not-hot-${key}`}
                      type="fill-extrusion"
                      source="lsgd"
                      paint={{
                        "fill-extrusion-color":
                          ZONE.COLOR[zones.districts[key].toUpperCase()],
                        "fill-extrusion-opacity": 0.8,
                        "fill-extrusion-height": zoneHeight(
                          zones.districts[key].toUpperCase()
                        ),
                        "fill-extrusion-vertical-gradient": true,
                      }}
                      onHover={onHover}
                      onLeave={onLeave}
                      onClick={onClick}
                    />
                    <Filter
                      layerId={`lsgd-not-hot-${key}`}
                      filter={[
                        "all",
                        ["!in", "LSGD", ...zones.hotspots],
                        ["==", "DISTRICT", key],
                      ]}
                    />
                  </div>
                );
              })}
              <div>
                {GenLL("district", false)}
                {GenLL("lsgd")}
              </div>
            </div>
          )}
          {mode === MODE.HOTSPOTS_DISTRICT && (
            <div>
              <GeolocateControl
                positionOptions={{ enableHighAccuracy: true, timeout: 1000 }}
                position="bottom-right"
                onGeolocate={onGeolocate}
                onError={onError}
              />
              {Object.keys(zones.districts).map((key, i) => {
                return (
                  <div key={i}>
                    <Layer
                      id={`zone-district-${key}`}
                      type="fill-extrusion"
                      source="district"
                      paint={{
                        "fill-extrusion-color":
                          ZONE.COLOR[zones.districts[key].toUpperCase()],
                        "fill-extrusion-opacity": 0.8,
                        "fill-extrusion-height": zoneHeight(
                          zones.districts[key].toUpperCase()
                        ),
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
          {mode <= MODE.STATS_CONFIRMED && (
            <div>
              {Object.keys(zones.districts).map((key, i) => {
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
          {(mode === MODE.CARE_VENTILATOR || mode === MODE.CARE_ICU) && (
            <div>
              {GenLL("district")}
              <Layer
                id="points"
                type="fill-extrusion"
                source={"care"}
                paint={{
                  "fill-extrusion-height": 10000,
                  "fill-extrusion-color": [
                    "interpolate",
                    ["linear"],
                    [
                      "/",
                      [
                        "get",
                        mode === MODE.CARE_VENTILATOR
                          ? "ventilator_current"
                          : "icu_current",
                      ],
                      [
                        "get",
                        mode === MODE.CARE_VENTILATOR
                          ? "ventilator_total"
                          : "icu_total",
                      ],
                    ],
                    0,
                    "green",
                    0.5,
                    "white",
                    1,
                    "red",
                  ],
                  "fill-extrusion-opacity": 0.8,
                }}
                onHover={onHover}
                onLeave={onLeave}
                onClick={onClick}
              />
              <Filter
                layerId="points"
                filter={[
                  "!=",
                  mode === MODE.CARE_ICU ? "icu_total" : "ventilator_total",
                  0,
                ]}
              />
            </div>
          )}
          {mode === MODE.CARE_HOSPITALS && (
            <div>
              {GenLL("district")}
              <Layer
                id="hospitals"
                type="fill-extrusion"
                source={"care"}
                paint={{
                  "fill-extrusion-height": 10000,
                  "fill-extrusion-color": "cyan",
                  "fill-extrusion-opacity": 0.8,
                }}
                onHover={onHover}
                onLeave={onLeave}
                onClick={onClick}
              />
            </div>
          )}
        </MapGL>
      </div>
    </div>
  );
}
