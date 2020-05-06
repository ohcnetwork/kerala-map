import React from "react";
import ReactMap from "./components/ReactMap";
import Navbar from "./components/Navbar";
import { useRoutes } from "hookrouter";

const routes = {
  "/": () => <ReactMap />,
};

function App() {
  const routeResult = useRoutes(routes);
  return (
    <div className="relative h-screen w-screen font-inter">
      <div className="absolute inset-x-0 top-0 z-40">
        <Navbar />
      </div>
      {routeResult}
    </div>
  );
}

export default App;
