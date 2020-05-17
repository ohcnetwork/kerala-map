import MapGL, {
  Filter,
  GeolocateControl,
  Layer,
  Source,
} from "@urbica/react-map-gl";
import React, { useEffect, useRef, useState } from "react";
import districtGeoData from "../assets/data/kerala_district.json";
import lsgdGeoData from "../assets/data/kerala_lsgd.json";
import { MAP, MODE, STATS, ZONE } from "../constants";
import Card from "./Card";

export default function MapBox({ dark, stats, zones, care }) {
  const mapRef = useRef(null);
  const [mode, setMode] = useState(MODE.STATS_ACTIVE);
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
    Object.keys(stats.latest).forEach((d) => {
      active = Math.max(active, stats.latest[d].active);
      confirmed = Math.max(confirmed, stats.latest[d].confirmed);
      deceased = Math.max(deceased, stats.latest[d].deceased);
      recovered = Math.max(recovered, stats.latest[d].recovered);
    });
    setStatsMax({
      active: active,
      confirmed: confirmed,
      deceased: deceased,
      recovered: recovered,
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
    if (mode === MODE.CARE_VENTILATOR || mode === MODE.CARE_ICU) {
      careActive(event);
    }
    if (
      mode === MODE.STATS_ACTIVE ||
      mode === MODE.STATS_CONFIRMED ||
      mode === MODE.STATS_DEATH ||
      mode === MODE.STATS_RECOVERED
    ) {
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
          <Source id="district" type="geojson" data={districtGeoData} />
          <Source id="lsgd" type="geojson" data={lsgdGeoData} />
          <Source id="care-icus" type="geojson" data={care.icus} />
          <Source
            id="care-ventilators"
            type="geojson"
            data={care.ventilators}
          />
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
              {Object.keys(zones.districts).map((key, index) => {
                return (
                  <div>
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
                {GenLL("lsgd")}
                {GenLL("district", false)}
                {/* {LSGDLL()}
                {DistrictLL(false)} */}
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
              {Object.keys(zones.districts).map((key, index) => {
                return (
                  <div>
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
          {(mode === MODE.STATS_ACTIVE ||
            mode === MODE.STATS_CONFIRMED ||
            mode === MODE.STATS_DEATH ||
            mode === MODE.STATS_RECOVERED) && (
            <div>
              {Object.keys(zones.districts).map((key, index) => {
                return (
                  <div>
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
                type="circle"
                source={
                  mode === MODE.CARE_VENTILATOR
                    ? "care-ventilators"
                    : "care-icus"
                }
                paint={{
                  "circle-radius": [
                    "case",
                    ["==", ["get", "id"], hoveredEntity && hoveredEntity.id],
                    10,
                    6,
                  ],
                  "circle-color": [
                    "interpolate",
                    ["linear"],
                    ["/", ["get", "current"], ["get", "total"]],
                    0,
                    "green",
                    0.5,
                    "white",
                    1,
                    "red",
                  ],
                  "circle-stroke-color": dark ? "white" : "black",
                  "circle-stroke-width": 1,
                  "circle-stroke-opacity": 0.5,
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
