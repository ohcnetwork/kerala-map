import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import MapGL, {
  GeolocateControl,
  Image,
  Layer,
  Source,
} from "@urbica/react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  MAP,
  MODAL_ACTION,
  MODE,
  STATS,
  STATS_COLOR_MODE_MAP,
  STATS_MODE_MAP,
  ZONE,
} from "../constants";
import { AuthContext } from "../context/AuthContext";
import { GeoContext } from "../context/GeoContext";
import { HoveredContext } from "../context/HoveredContext";
import { ModalContext } from "../context/ModalContext";
import { ModeContext } from "../context/ModeContext";
import { ThemeContext } from "../context/ThemeContext";
import Card from "./Card";

const modes = MapboxDraw.modes;
modes.static_mode = {};
modes.static_mode.onSetup = function() {
  this.setActionableState();
  return {};
};
modes.static_mode.toDisplayFeatures = function(state, geojson, display) {
  display(geojson);
};

export default function MapBox({
  stats,
  zones,
  geoJSONs,
  descriptions,
  features,
}) {
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

  const district = useMemo(() => {
    let _district = geoJSONs.district;
    _district.features = _district.features.reduce((p, f) => {
      if (f.properties.DISTRICT != "Mahe") {
        f.properties = {
          ...f.properties,
          active: stats.latest[f.properties.DISTRICT].active,
          confirmed: stats.latest[f.properties.DISTRICT].confirmed,
          deceased: stats.latest[f.properties.DISTRICT].deceased,
          recovered: stats.latest[f.properties.DISTRICT].recovered,
          total_obs: stats.latest[f.properties.DISTRICT].total_obs,
          hospital_obs: stats.latest[f.properties.DISTRICT].hospital_obs,
          home_obs: stats.latest[f.properties.DISTRICT].home_obs,
          hospital_today: stats.latest[f.properties.DISTRICT].hospital_today,
        };
        p.push(f);
      }
      return p;
    }, []);
    return _district;
  }, [stats]);

  const { dark } = useContext(ThemeContext);
  const { geolocatedLoc, setGeolocatedLoc } = useContext(GeoContext);
  const { setHoveredEntity } = useContext(HoveredContext);
  const { auth } = useContext(AuthContext);
  const mapRef = useRef(null);
  const { mode } = useContext(ModeContext);
  const { setModal } = useContext(ModalContext);
  const [draw, setDraw] = useState(null);
  const [featuresEnabled, setFeaturesEnabled] = useState(false);
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
    if (src) {
      src.setData(lsgd);
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
    if (draw) {
      auth.logged
        ? draw.changeMode("simple_select")
        : draw.changeMode("static_mode");
    }
  }, [auth.logged, draw]);

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
    const map = mapRef.current.getMap();
    let _draw = new MapboxDraw({
      modes: modes,
      controls: {
        point: false,
        line_string: false,
        polygon: false,
        trash: false,
        combine_features: false,
        uncombine_features: false,
      },
    });
    map.addControl(_draw, "bottom-right");
    map.on("draw.create", (event) => {
      setModal({
        show: true,
        action: MODAL_ACTION.FEATURE_UPDATE,
        payload: {
          id: 0,
          data: JSON.stringify(event.features[0]),
          description: "",
        },
      });
    });
    map.on("draw.delete", (event) => {
      {
        setModal({
          show: true,
          action: MODAL_ACTION.FEATURE_DELETE,
          payload: {
            id: event.features[0].properties.FEATURE_ID,
          },
        });
      }
    });
    map.on("draw.update", (event) => {
      setModal({
        show: true,
        action: MODAL_ACTION.FEATURE_UPDATE,
        payload: {
          id: event.features[0].properties.FEATURE_ID,
          data: JSON.stringify(event.features[0]),
          description: event.features[0].properties.FEATURE_DESC,
        },
      });
    });
    map.on("click", (e) => {
      let f = map.queryRenderedFeatures(e.point);
      let displayProperties = [
        "type",
        "properties",
        "id",
        "layer",
        "source",
        "sourceLayer",
        "state",
      ];
      let displayFeatures = f
        .filter((feat) =>
          [
            "district-stats",
            "lsgd-hot-desc",
            "gl-draw-polygon-fill-active.cold",
            "gl-draw-polygon-fill-inactive.cold",
            "gl-draw-polygon-fill-inactive.hot",
          ].includes(feat.layer.id)
        )
        .map((feat) => {
          let displayFeat = {};
          displayProperties.forEach((prop) => {
            displayFeat[prop] = feat[prop];
          });
          return displayFeat;
        });
      let q = {
        p:
          displayFeatures.filter(
            (feat) =>
              feat.layer.id === "lsgd-hot-desc" ||
              feat.layer.id === "district-stats"
          )[0] || null,
        f: displayFeatures
          .filter((feat) =>
            [
              "gl-draw-polygon-fill-active.cold",
              "gl-draw-polygon-fill-inactive.cold",
              "gl-draw-polygon-fill-inactive.hot",
            ].includes(feat.layer.id)
          )
          .map((feat) =>
            _draw
              .getAll()
              .features.find((item) => item.id === feat.properties.id)
          ),
      };
      setHoveredEntity(q);
    });
    setDraw(_draw);
  }, []);

  useEffect(() => {
    if (draw) {
      draw.set({
        type: "FeatureCollection",
        features: mode === MODE.CONTAINMENT && featuresEnabled ? features : [],
      });
    }
  }, [draw, features, mode, featuresEnabled]);

  const onGeolocate = (data) => {
    if (mapRef) {
      const map = mapRef.current.getMap();
      const p = data.target._userLocationDotMarker._pos;
      let _f = map.queryRenderedFeatures([p.x, p.y]);
      if (!_f) {
        return;
      }
      const f = _f.find((e) => e.layer.id === "lsgd-hot-desc");
      if (f == undefined) {
        setGeolocatedLoc(null);
        return;
      }
      setGeolocatedLoc({
        p: f.properties,
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

  return (
    <div className="flex flex-col min-w-full min-h-full lg:flex-row">
      <Card
        zones={zones}
        stats={stats}
        draw={draw}
        descriptions={descriptions}
        features={features}
        featuresEnabled={featuresEnabled}
        setFeaturesEnabled={setFeaturesEnabled}
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
          viewportChangeMethod="flyTo"
          viewportChangeOptions={{ duration: 1000 }}
          {...viewport}
          ref={mapRef}
        >
          <Source id="district" type="geojson" data={district} />
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
              <Layer
                id="district-stats"
                type="fill-extrusion"
                source="district"
                paint={{
                  "fill-extrusion-color": [
                    "interpolate",
                    ["linear"],
                    [
                      "/",
                      ["get", STATS_MODE_MAP.find((j) => j[0] === mode)[1]],
                      statsMax[STATS_MODE_MAP.find((j) => j[0] === mode)[1]],
                    ],
                    0,
                    "white",
                    1,
                    STATS_COLOR_MODE_MAP.find((j) => j[0] === mode)[1],
                  ],
                  "fill-extrusion-opacity": 0.8,
                  "fill-extrusion-height": [
                    "*",
                    [
                      "/",
                      ["get", STATS_MODE_MAP.find((j) => j[0] === mode)[1]],
                      statsMax[STATS_MODE_MAP.find((j) => j[0] === mode)[1]],
                    ],
                    STATS.HEIGHT_MULTIPLIER,
                  ],
                  "fill-extrusion-vertical-gradient": true,
                }}
              />
              {GenLL("district")}
            </div>
          )}
        </MapGL>
      </div>
    </div>
  );
}
