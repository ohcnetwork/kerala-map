import React, { useState, useRef } from "react";
import lsgdGeoData from "../assets/data/kerala_lsgd.json";
import districtGeoData from "../assets/data/kerala_district.json";
import MapGL, { Source, Layer, Filter } from "@urbica/react-map-gl";
import Card from "./Card";

const MAPBOX_ACCESS_TOKEN = process.env.POI_APP_MAPBOX_ACCESS_TOKEN;
const HEIGHTMULTIPLIER = 2;
const MAXZOOM = 11.824974653320604;
const DISTRICTLINE = "#877b59";
const LSGDLINE = "#871a59";
const ZONECOLOR = {
  CONTAINMENT: "#3182CE",
  RED: "#E53E3E",
  ORANGE: "#DD6B20",
  GREEN: "#38A169",
};
const MAXBOUNDS = [
  [71.05, 8.12],
  [81.1, 12.95],
];
const BASEMAP = {
  DARK: "mapbox://styles/saanu09xs/ck9vk938f10811irwhfr1gn4c",
  LIGHT: "mapbox://styles/saanu09xs/ck9w8haky07k91is3pn3dmlxj",
};

export default function MapBox({
  stats,
  zones,
  hotspots,
  darkMode,
  districtOnly,
}) {
  const mapRef = useRef(null);
  const [clicked, setClicked] = useState(false);
  const [hoveredEntity, setHoveredEntity] = useState(null);
  const [viewport, setViewport] = useState({
    latitude: (MAXBOUNDS[0][1] + MAXBOUNDS[1][1]) / 2,
    longitude: (MAXBOUNDS[0][0] + MAXBOUNDS[1][0]) / 2,
    zoom: 1,
  });

  const onClick = (event) => {
    if (event.features) {
      if (event.features.length > 0) {
        let f = event.features[0];
        if (
          hoveredEntity === null ||
          (hoveredEntity && hoveredEntity.id !== f.id)
        ) {
          let z = f.layer.id.includes("lsgd-hot")
            ? "CONTAINMENT"
            : zones[f.properties.DISTRICT].toUpperCase();
          setHoveredEntity({
            id: f.id,
            p: f.properties,
            zone: z,
          });
        }
        setClicked(true);
      }
    } else {
      setClicked(false);
      setHoveredEntity(null);
    }
  };

  const onHover = (event) => {
    if (event.features.length > 0 && !clicked) {
      let f = event.features[0];
      if (
        hoveredEntity === null ||
        (hoveredEntity && hoveredEntity.id !== f.id)
      ) {
        let z = f.layer.id.includes("lsgd-hot")
          ? "CONTAINMENT"
          : zones[f.properties.DISTRICT].toUpperCase();
        setHoveredEntity({
          id: f.id,
          p: f.properties,
          zone: z,
        });
      }
    }
  };

  const onLeave = () => {
    if (hoveredEntity && !clicked) {
      setHoveredEntity(null);
    }
  };

  const zoneHeight = (z) => {
    return (
      HEIGHTMULTIPLIER *
      (z === "GREEN" ? 500 : z === "ORANGE" ? 1500 : z === "RED" ? 3000 : 5000)
    );
  };

  const LabelandLines = () => {
    return (
      <div>
        <Layer
          id="lsgd-line"
          type="line"
          source="lsgd"
          paint={{
            "line-color": LSGDLINE,
            "line-width": 1,
            "line-translate-anchor": "viewport",
          }}
          layout={{
            visibility: !districtOnly ? "visible" : "none",
          }}
        />
        <Layer
          id="district-line"
          type="line"
          source="district"
          paint={{
            "line-color": DISTRICTLINE,
            "line-width": 1,
            "line-translate-anchor": "viewport",
          }}
        />
        <Layer
          id="district-label"
          type="symbol"
          source="district"
          paint={{
            "text-color": "#ffffff",
            "text-translate-anchor": "viewport",
          }}
          layout={{
            "text-field": ["get", "DISTRICT"],
            "text-size": 10,
            "text-variable-anchor": ["center"],
            "text-justify": "auto",
            visibility: districtOnly ? "visible" : "none",
          }}
        />
        <Layer
          id="lsgd-label"
          type="symbol"
          source="lsgd"
          paint={{
            "text-color": "#ffffff",
            "text-translate-anchor": "viewport",
          }}
          layout={{
            "text-field": ["get", "LSGD"],
            "text-size": 10,
            "text-variable-anchor": ["center"],
            "text-justify": "auto",
            visibility: !districtOnly ? "visible" : "none",
          }}
        />
      </div>
    );
  };
  return (
    <div className="flex flex-col lg:flex-row min-h-full min-w-full relative">
      <div className="absolute flex flex-grow w-full lg:w-1/6 order-last lg:order-first z-40 pointer-events-none select-none">
        <Card
          hotspots={hotspots}
          zones={zones}
          stats={stats}
          hoveredEntity={hoveredEntity}
          darkMode={darkMode}
        />
      </div>
      <div
        className="flex flex-grow w-full lg:w-5/6"
        style={{ minHeight: "90vh" }}
      >
        <MapGL
          style={{ width: "100%", ZAxis: "0" }}
          mapStyle={darkMode ? BASEMAP.DARK : BASEMAP.LIGHT}
          accessToken={MAPBOX_ACCESS_TOKEN}
          onViewportChange={setViewport}
          maxBounds={MAXBOUNDS}
          maxZoom={MAXZOOM}
          mapRef={mapRef}
          onClick={onClick}
          {...viewport}
        >
          <Source id="district" type="geojson" data={districtGeoData} />
          <Source id="lsgd" type="geojson" data={lsgdGeoData} />
          {!districtOnly ? (
            <div>
              <Layer
                id="lsgd-hot"
                type="fill-extrusion"
                source="lsgd"
                paint={{
                  "fill-extrusion-color": ZONECOLOR.CONTAINMENT,
                  "fill-extrusion-opacity": 0.8,
                  "fill-extrusion-height": zoneHeight("CONTAINMENT"),
                }}
                onHover={onHover}
                onLeave={onLeave}
                onClick={onClick}
              />
              <Filter layerId="lsgd-hot" filter={["in", "LSGD", ...hotspots]} />

              {Object.keys(zones).map((key, index) => {
                return (
                  <div>
                    <Layer
                      id={`lsgd-not-hot-${key}`}
                      type="fill-extrusion"
                      source="lsgd"
                      paint={{
                        "fill-extrusion-color":
                          ZONECOLOR[zones[key].toUpperCase()],
                        "fill-extrusion-opacity": 0.8,
                        "fill-extrusion-height": zoneHeight(
                          zones[key].toUpperCase()
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
                        ["!in", "LSGD", ...hotspots],
                        ["==", "DISTRICT", key],
                      ]}
                    />
                  </div>
                );
              })}
              {LabelandLines()}
            </div>
          ) : (
            <div>
              {Object.keys(zones).map((key, index) => {
                return (
                  <div>
                    <Layer
                      id={`zone-district-${key}`}
                      type="fill-extrusion"
                      source="district"
                      paint={{
                        "fill-extrusion-color":
                          ZONECOLOR[zones[key].toUpperCase()],
                        "fill-extrusion-opacity": 0.8,
                        "fill-extrusion-height": zoneHeight(
                          zones[key].toUpperCase()
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
              {LabelandLines()}
            </div>
          )}
        </MapGL>
      </div>
    </div>
  );
}