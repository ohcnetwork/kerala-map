import { useHash } from "raviger";
import React, { useEffect } from "react";

export default function Zones({ dark }) {
  const id = useHash();
  useEffect(() => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
      });
    }
  });
  return (
    <div
      className={`flex flex-col min-h-full min-w-full mt-10 lg:mt-0 p-4 ${
        dark ? "text-white" : "text-black"
      }`}
    >
      <div className="">To be implemented</div>
      <h1 id="hotspots" className="mb-64">
        hotspots info
      </h1>
      <div>hotspots info</div>
      <h1 id="hotspot-list" className="mb-64">
        hotspot list
      </h1>
      <div>hotspot list</div>
      <h1 id="zones" className="mb-64">
        zones
      </h1>
      <div>zones</div>
      <h1 id="zone-containment" className="mb-64">
        zone-containment
      </h1>
      <div>zone-containment</div>
      <h1 id="zone-red" className="mb-64">
        zone-red
      </h1>
      <div>zone-red</div>
      <h1 id="zone-orange" className="mb-64">
        zone-orange
      </h1>
      <div>zone-orange</div>
      <h1 id="zone-green" className="mb-64">
        zone-green
      </h1>
      <div>zone-green</div>
      <h1 id="other" className="mb-64">
        other
      </h1>
      <div>other</div>
    </div>
  );
}
