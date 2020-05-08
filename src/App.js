import React, { useState, useEffect } from "react";
import MapBox from "./components/MapBox";
import { useRoutes } from "hookrouter";
import axios from "axios";
import { Info, Moon, Sun, Target, ChevronLeft } from "react-feather";

const routes = {
  "/": () => (stats, zones, hotspots, darkMode, districtOnly) => (
    <MapBox
      stats={stats}
      zones={zones}
      hotspots={hotspots}
      darkMode={darkMode}
      districtOnly={districtOnly}
    />
  ),
};

function App() {
  const [stats, setStats] = useState({});
  const [darkMode, setDarkMode] = useState(true);
  const [districtOnly, setDistrictOnly] = useState(false);
  const [hotspots, setHotspots] = useState([]);
  const [zones, setZones] = useState({});
  const [fetched, setFetched] = useState(false);
  const routeResult = useRoutes(routes);
  useEffect(() => {
    if (!fetched) {
      (async () => {
        let response = await axios.get(
          "https://keralastats.coronasafe.live/latest.json"
        );
        let latest = response.data.summary;
        response = await axios.get(
          "https://keralastats.coronasafe.live/summary.json"
        );
        let summary = response.data.summary;
        let lastUpdated = response.data.last_updated;
        response = await axios.get(
          "https://keralastats.coronasafe.live/hotspots.json"
        );
        setHotspots(
          response.data.hotspots.reduce((acc, row) => [...acc, row.lsgd], [])
        );
        response = await axios.get(
          "https://keralastats.coronasafe.live/zones.json"
        );
        setZones(response.data.districts);
        setStats({
          latest: latest,
          summary: summary,
          lastUpdated: lastUpdated,
        });
        setFetched(true);
      })();
    }
  }, [fetched]);
  return fetched ? (
    <div className="flex relative h-screen w-screen font-inter overflow-hidden">
      <div className="flex flex-col absolute top-0 right-0 z-40">
        <div className="flex flex-col mb-2 items-center">
          <a className="flex w-48 mr-1 lg:mr-2 mt-1 lg:mt-2 mb-0" href="./">
            <img
              className="object-contain"
              src={require("./assets/img/coronaSafeLogo.svg")}
              title="CoronaSafe: Corona Literacy Mission"
              alt="CoronaSafe Logo: Corona Literacy Mission"
            />
          </a>
          <div
            className={`group flex self-end text-mobilexs mr-2 fill-current ${
              darkMode ? "text-white" : "text-black"
            }`}
          >
            <div className="flex flex-row transform scale-0 group-hover:scale-100 transition duration-150 ease-in-out origin-right space-x-2">
              <a href="/">
                <div className="flex flex-row items-center cursor-pointer">
                  <Info className="flex mr-1" size={"1rem"} />
                  Info
                </div>
              </a>

              {darkMode ? (
                <div
                  className="flex flex-row items-center cursor-pointer"
                  onClick={() => setDarkMode(!darkMode)}
                >
                  <Sun className="flex mr-1" size={"1rem"} />
                  Light
                </div>
              ) : (
                <div
                  className="flex flex-row items-center cursor-pointer"
                  onClick={() => setDarkMode(!darkMode)}
                >
                  <Moon className="flex mr-1" size={"1rem"} />
                  Dark
                </div>
              )}
              <div
                className="flex flex-row items-center cursor-pointer"
                onClick={() => setDistrictOnly(!districtOnly)}
              >
                <Target className="flex mr-1" size={"1rem"} />
                {!districtOnly ? "DISTRICT" : "LSGD"}
              </div>
            </div>
            <ChevronLeft
              size={"1rem"}
              className="transform group-hover:scale-0 transition duration-150 ease-in-out cursor-pointer relative right-0"
            />
          </div>
        </div>
      </div>
      {routeResult(stats, zones, hotspots, darkMode, districtOnly)}
    </div>
  ) : (
    <div className="flex h-screen w-screen items-center justify-center overflow-hidden">
      <div className="lds-ripple">
        <div></div>
        <div></div>
      </div>
    </div>
  );
}

let App_ = App;
if (process.env.NODE_ENV === "production") {
  App_ = App;
}

export default App_;
