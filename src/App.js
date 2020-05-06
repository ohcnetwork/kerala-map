import React, { useState, useEffect } from "react";
import ReactMap from "./components/ReactMap";
import Navbar from "./components/Navbar";
import { useRoutes } from "hookrouter";
import axios from "axios";

const routes = {
  '/': (stats) => <ReactMap stats={stats}/>,
};

function App() {
  const [stats, setStats] = useState({});
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
    <div className="relative h-screen w-screen font-inter">
      <div className="absolute inset-x-0 top-0 z-40">
        <Navbar />
      </div>
      {routeResult}
    </div>
  ) : (
    <div className="lds-dual-ring h-screen w-screen items-center justify-center overflow-hidden flex"></div>
  );
}

export default App;
