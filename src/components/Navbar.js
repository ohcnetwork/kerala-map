import React from "react";
import { navigate } from "hookrouter";

export default function Navbar() {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center min-w-full mx-auto p-3 bg-transparent">
      <a className="flex w-1/2 md:w-1/6 justify-start" href="./">
        <img
          className="object-contain"
          src={require("../assets/img/coronaSafeLogo.svg")}
          title="CoronaSafe: Corona Literacy Mission"
          alt="CoronaSafe Logo: Corona Literacy Mission"
        />
      </a>
      <div className="flex text-white">
        <a href="/">
          <div className="px-2 py-1 mr-2">
            <div className="text-md font-semibold">Map</div>
          </div>
        </a>
      </div>
    </div>
  );
}
