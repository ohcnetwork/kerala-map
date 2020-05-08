import React, { useState, useEffect } from "react";
import MapBox from "./components/MapBox";
import { useRoutes } from "hookrouter";
import axios from "axios";
import { Info, Moon, Sun, Target, ChevronDown } from "react-feather";

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
    <div className="flex relative h-screen w-screen font-inter overflow-y-scroll lg:overflow-hidden">
      <div className="flex flex-col absolute top-0 right-0 z-40">
        <div className="flex flex-col mb-2 items-center">
          <a className="flex w-48 m-1 lg:m-2" href="./">
            <img
              className="object-contain"
              src={require("./assets/img/coronaSafeLogo.svg")}
              title="CoronaSafe: Corona Literacy Mission"
              alt="CoronaSafe Logo: Corona Literacy Mission"
            />
          </a>
          <div
            className={`group inline-block self-end mr-2 fill-current ${
              darkMode ? "text-white" : "text-black"
            }`}
          >
            <ChevronDown
              cursor="pointer"
              size={20}
              className="transform group-hover:-rotate-180 transition duration-150 ease-in-out"
            />
            <ul className="transform scale-0 group-hover:scale-100 absolute transition duration-150 ease-in-out origin-top space-y-1">
              <li>
                <Info cursor="pointer" size={20} href="/" />
              </li>
              <li>
                {darkMode ? (
                  <Sun
                    cursor="pointer"
                    size={20}
                    onClick={() => setDarkMode(!darkMode)}
                  />
                ) : (
                  <Moon
                    cursor="pointer"
                    size={20}
                    onClick={() => setDarkMode(!darkMode)}
                  />
                )}
              </li>
              <li>
                <Target
                  cursor="pointer"
                  size={20}
                  onClick={() => setDistrictOnly(!districtOnly)}
                />
              </li>
            </ul>
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
