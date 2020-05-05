import React, { useEffect, useState } from 'react';
import districtData from '../assets/data/kerala_village.json'
import {
  Map,
  GeoJSON,
  TileLayer,
} from 'react-leaflet';
import axios from 'axios';

const papaparseOptions = {
  header: true,
  dynamicTyping: true,
  skipEmptyLines: true,
  transformHeader: header => header.toLowerCase().replace(/\W/g, "_")
};
const center = [9.9312, 76.2673];

export default function MapContainer(){
    const [hotspotData, setHotspotData] = useState();
    useEffect(()=>{
      const parseHotspotData = ({data}) => {
        setHotspotData(data.reduce((acc,row) => {
          console.log(row)
          return {
            ...acc,
            [row.lsgd] : row
          }
        }, {}))
      }
      axios.get("https://raw.githubusercontent.com/coronasafe/kerala_stats/master/hotspots.json").then((response)=>{
        setHotspotData((response.data.hotspots).reduce((acc,row) => {
          console.log(row)
          return {
            ...acc,
            [row.lsgd] : row
          }
        }, {}))
      }).catch(()=>console.log("Error Fetching Data"))
    },[])
    const geoJSONStyle = (feature) => {
      const spot = hotspotData[feature.properties.NAME]
      return {
        color: '#718096',
        weight: 1,
        fillOpacity: 0.5,
        fillColor: spot ? spot.zone==="orange" ? '#ed8936' : spot.zone==="green" ? '#48bb78' : spot.zone==="red" ? '#e53e3e' :'transparent' :'transparent',
      }}
    const renderTooltip = (feature) => {
      const featureData = hotspotData[feature.properties.NAME]
      return featureData ?  (
        `${feature.properties.NAME} <br/>
          Zone: ${featureData.zone}`
      ) : `${feature.properties.NAME} <br/>
            No Data`
    }
    const onEachFeature = (feature: Object, layer: Object) => {
      const tooltipChildren = renderTooltip(feature);
      const popupContent = `<Popup> ${tooltipChildren} </Popup>`
      layer.bindPopup(popupContent)
    }
    return (
      hotspotData ?
      <Map center={center} zoom={9} minZoom={8} >
        <TileLayer
          attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png"
        />
        <GeoJSON
              data={districtData}
              style={geoJSONStyle}
              onEachFeature={onEachFeature}
            />
        </Map> : <div class="lds-dual-ring h-screen w-screen items-center justify-center overflow-hidden flex"></div>
    )
}