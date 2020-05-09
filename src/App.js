import React, { useState, useEffect } from "react";
import MapBox from "./components/MapBox";
import { useRoutes, Link } from "raviger";
import axios from "axios";
import {
  Info,
  Moon,
  Sun,
  Target,
  ChevronDown,
  Map,
  Activity,
} from "react-feather";
import Zones from "./components/Info";
import { hot } from "react-hot-loader";

const routes = {
  "/": ({ darkMode, stats, zones, hotspots, districtOnly }) => (
    <MapBox
      stats={stats}
      zones={zones}
      hotspots={hotspots}
      darkMode={darkMode}
      districtOnly={districtOnly}
    />
  ),
  "/info": ({ darkMode }) => <Zones darkMode={darkMode} />,
};

function App() {
  const [stats, setStats] = useState({});
  const [darkMode, setDarkMode] = useState(true);
  const [districtOnly, setDistrictOnly] = useState(false);
  const [hotspots, setHotspots] = useState([]);
  const [zones, setZones] = useState({});
  const [fetched, setFetched] = useState(false);
  const route = useRoutes(routes, {
    routeProps: { darkMode, stats, zones, hotspots, districtOnly },
  });

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
    <div
      className={`flex relative min-h-screen min-w-screen overflow-x-hidden antialiased font-inter ${
        darkMode ? "bg-dark-500" : "bg-light-500"
      }`}
    >
      <div
        className={`flex flex-col fixed top-0 right-0 z-40 m-2 items-end uppercase fill-current ${
          darkMode ? "text-white" : "text-black"
        }`}
      >
        <div className="leading-none font-extrabold tracking-wider text-xl lg:text-3xl text-right select-none">
          HOTSPOTS MAP
        </div>
        <div className="flex text-mobilexs lg:text-mobile content-center select-none">
          <p>Part of</p>
          <a
            className="inline w-12 lg: ml-1"
            href="https://coronasafe.network/"
          >
            <img
              src={require("./assets/img/coronaSafeLogo.svg")}
              title="CoronaSafe: Corona Literacy Mission"
              alt="CoronaSafe Logo: Corona Literacy Mission"
            />
          </a>
        </div>
        <div className="group flex text-mobilexs">
          <div className="flex items-end flex-col lg:w-full transform scale-0 group-hover:scale-100 transition duration-150 ease-in-out origin-right space-y-1 mt-1">
            <Link href="/">
              <div className="flex flex-row items-center cursor-pointer">
                Map
                <Map className="flex ml-1" size={"0.8rem"} />
              </div>
            </Link>
            <Link href="/info">
              <div className="flex flex-row items-center cursor-pointer">
                Info
                <Info className="flex ml-1" size={"0.8rem"} />
              </div>
            </Link>
            <a href="https://keralamap.coronasafe.network/">
              <div className="flex flex-row items-center cursor-pointer">
                Dashboard
                <Activity className="flex ml-1" size={"0.8rem"} />
              </div>
            </a>
            {darkMode ? (
              <div
                className="flex flex-row items-center cursor-pointer"
                onClick={() => setDarkMode(!darkMode)}
              >
                Light
                <Sun className="flex ml-1" size={"0.8rem"} />
              </div>
            ) : (
              <div
                className="flex flex-row items-center cursor-pointer"
                onClick={() => setDarkMode(!darkMode)}
              >
                Dark
                <Moon className="flex ml-1" size={"0.8rem"} />
              </div>
            )}
            <div
              className="flex flex-row items-center cursor-pointer"
              onClick={() => setDistrictOnly(!districtOnly)}
            >
              {!districtOnly ? "DISTRICT" : "LSGD"}
              <Target className="flex ml-1" size={"0.8rem"} />
            </div>
          </div>
          <ChevronDown
            size={"0.8rem"}
            className="transform group-hover:scale-0 transition duration-150 ease-in-out cursor-pointer absolute right-0"
          />
        </div>
      </div>
      {!route ? <div>Not found</div> : route}
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

export default hot(module)(App);
