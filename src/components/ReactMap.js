import React, { useEffect, useState } from "react";
import lsgdGeoData from "../assets/data/kerala_lsgd_compressed.json";
import Control from "react-leaflet-control";
import { Map, GeoJSON, TileLayer, ZoomControl } from "react-leaflet";
import L from "../assets/js/leaflet";
import axios from "axios";

const center = [10.551235, 76.034386];
const bounds = L.latLngBounds(
  L.latLng(12.799159, 74.446244),
  L.latLng(8.209846, 77.623563)
);
const zoom = 8

export default function MapContainer() {
  const [fetched, setFetched] = useState(false);
  const [hotspots, setHotspots] = useState([]);
  const [zones, setZones] = useState({});
  const [state, setState] = useState({
    center: center,
    zoom: zoom,
  });
  useEffect(() => {
    if (!fetched) {
      axios
        .get("https://keralastats.coronasafe.live/hotspots.json")
        .then((response) => {
          setHotspots(
            response.data.hotspots.reduce((acc, row) => [...acc, row.lsgd], [])
          );
        })
        .catch(() => console.log("Error Fetching Data"));
      axios
        .get("https://keralastats.coronasafe.live/zones.json")
        .then((response) => {
          setZones(response.data.districts);
        })
        .catch(() => console.log("Error Fetching Data"));
      setFetched(true);
    }
  }, [fetched]);

  const hotspotStyle = (feature) => {
    return {
      color: "gray",
      weight: 0.5,
      fillOpacity: 0.5,
      fillColor: hotspots.includes(feature.properties.LSGD)
        ? "#800000"
        : zones[feature.properties.DISTRICT],
    };
  };

  const renderTooltip = (feature) => {
    return hotspots.includes(feature.properties.LSGD)
      ? `${feature.properties.LSGD} <br/>
          Zone: Containment`
      : `${feature.properties.LSGD} <br/>
            No Data`;
  };

  const onEachFeature = (feature, layer) => {
    const tooltipChildren = renderTooltip(feature);
    const popupContent = `<Popup> ${tooltipChildren} </Popup>`;
    layer.bindPopup(popupContent);
  };

  const streetLabelsRenderer = new L.StreetLabels({
    collisionFlg: true,
    propertyName: "LSGD",
    showLabelIf: function (layer) {
      return true;
    },
    fontStyle: {
      dynamicFontSize: true,
      fontSize: 10,
      fontSizeUnit: "px",
      lineWidth: 1.0,
      fillStyle: "white",
    },
  });

  return fetched ? (
    <Map
      center={state.center}
      // bounds={state.bounds}
      minZoom={7}
      zoom={state.zoom}
      zoomControl={false}
      zoomDelta={0.25}
      renderer={streetLabelsRenderer}
    >
      <TileLayer
        attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
      />
      <ZoomControl position="bottomright" />
      <GeoJSON
        data={lsgdGeoData}
        style={hotspotStyle}
        onEachFeature={onEachFeature}
      />
      <Control position="bottomright">
        <button className="text-white" onClick={() => setState({ center: center, zoom: zoom })}>
          Reset View
        </button>
      </Control>
    </Map>
  ) : (
    <div className="lds-dual-ring h-screen w-screen items-center justify-center overflow-hidden flex"></div>
  );
}
