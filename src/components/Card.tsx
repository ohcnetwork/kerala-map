import React, { useState,useRef } from "react";
import { Plus } from "react-feather";
import {
  MODE,
  MODE_BUTTON,
  MODE_LANG,
  MODE_SUBHEADER_LANG,
  STATS,
  ZONE,
} from "../constants";

export default function Card({
  mode,
  setMode,
  dark,
  stats,
  zones,
  hoveredEntity,
  geolocatedLoc,
  setGeolocatedLoc,
}) {
  const lens = {
    CONTAINMENT: zones.hotspots.length,
  };
  const [cardEnabled, setCardEnabled] = useState(true);
  const [modeCard, setModeCard] = useState("");
  const [controlTip, setControlTip] = useState("");
  // const admin = localStorage.getItem("admin");
  const admin = localStorage.getItem("admin");
  const [editDescription,setEditDescription] = useState(false);
  const [description,setDescription] = useState("")


  const distStats = (d) => {
    return Object.keys(STATS.LANG).map((a, i) => (
      <div key={i}>
        <div className="text-mobiles lg:text-xs">{STATS.LANG[a]}</div>
        <div className="font-semibold text-mobile lg:text-sm">
          {stats.latest[d][a]}
        </div>
      </div>
    ));
  };

  const statsinfo = () => {
    return Object.keys(STATS.LANG).map((a, i) => (
      <div key={i}>
        <div className="text-mobiles lg:text-xs">{STATS.LANG[a]}</div>
        <div className="font-semibold text-mobile lg:text-sm">
          {stats.summary[a]}
        </div>
      </div>
    ));
  };

  const info = (p, z) => {
    return (
      <div className="flex flex-col mb-2 uppercase">
        <div className="mb-2">
          {p.LSGD && (
            <div>
              <div className="text-mobiles lg:text-xs">LSGD</div>
              <div className="font-semibold text-mobile lg:text-sm">
                {p.LSGD}
              </div>
            </div>
          )}
          {p.LSGD && z === "CONTAINMENT" && (
            <div>
              <div className="text-mobiles lg:text-xs">WARDS</div>
              <div className="font-semibold text-mobile lg:text-sm">
                {
                  zones.hotspots.find(
                    (e) => e.lsgd === p.LSGD && e.district === p.DISTRICT
                  ).wards
                }
              </div>
            </div>
          )}
          <div>
            <div className="text-mobiles lg:text-xs">DISTRICT</div>
            <div className="font-semibold text-mobile lg:text-sm">
              {p.DISTRICT}
            </div>
          </div>
        </div>
        {distStats(p.DISTRICT)}
        <div>
            <div className="text-mobiles lg:text-xs">Description</div>
              {/* data of description change value to the api key here  */}
              {
                editDescription?(
                  <div className="lg:text-sm flex flex-col z-50">
                    <input value={description} onChange={(evt)=>{setDescription(evt.target.value)}}
                    className={`${dark?"border-white":"border-black"} shadow appearance-none border rounded bg-transparent w-full p-1 mb-2 leading-tight focus:outline-none focus:shadow-outline`}/>
                    <button onClick={()=>{console.log(description)}}
                    className={`${dark?"border-white":"border-black"} self-end inline-flex justify-center rounded-md border px-1 text-mobile sm:text-mobile leading-6 font-medium shadow-sm hover:text-gray-700 focus:outline-none transition ease-in-out duration-150`}>Submit</button>
                  </div>
                ):null //add above text type here
              }
              {
                admin? (!editDescription && <button onClick={()=>{setEditDescription(true)}}
                className={`${dark?"border-white":"border-black"} self-end inline-flex justify-center rounded-md border px-1 text-mobile sm:text-mobile leading-6 font-medium shadow-sm hover:text-gray-700 focus:outline-none transition ease-in-out duration-150`}>Edit</button>)
                :null
              }
          </div>
      </div>
    );
  };

  const changeMode = (m: number) => {
    setMode(m);
  };

  const subControl = (l: string[]) => {
    return l.map((a, i) => (
      <div
        key={i}
        className={`text-mobilexs lg:text-xs pointer-events-auto cursor-pointer bg-opacity-50 font-semibold leading-none p-sm border ${
          dark ? "bg-black border-white" : "bg-white border-black"
        } ${mode !== MODE[a] ? "border-opacity-0" : "border-opacity-100"}`}
        onClick={() => changeMode(MODE[a])}
        onMouseEnter={() =>
          setControlTip(MODE_LANG.find((j) => j[0] === MODE[a])[1].toString())
        }
        onMouseLeave={() => setControlTip("")}
      >
        {MODE_BUTTON.find((j) => j[0] === MODE[a])[1].toString()}
      </div>
    ));
  };

  const control = () => {
    return (
      cardEnabled && (
        <div className="flex flex-col">
          <div className="grid grid-flow-row-dense grid-flow-col-dense gap-1 mb-1 font-semibold leading-none text-center text-mobiles lg:text-sm">
            <div
              className={`pointer-events-auto cursor-pointer bg-opacity-50 p-sm ${
                dark ? "bg-black" : "bg-white"
              }`}
              onClick={() => {
                setModeCard("");
                changeMode(MODE.CONTAINMENT);
              }}
              onMouseEnter={() =>
                setControlTip(
                  MODE_LANG.find((j) => j[0] === MODE.CONTAINMENT)[1].toString()
                )
              }
              onMouseLeave={() => setControlTip("")}
            >
              CONTAINMENT
            </div>
            <div
              className={`pointer-events-auto cursor-pointer bg-opacity-50 p-sm ${
                dark ? "bg-black" : "bg-white"
              }`}
              onClick={() =>
                modeCard === "STATS" ? setModeCard("") : setModeCard("STATS")
              }
            >
              STATS
            </div>
          </div>
          {modeCard && (
            <div className="grid grid-flow-row-dense grid-flow-col-dense grid-cols-none grid-rows-4 gap-1 mb-1 font-semibold leading-none text-center text-mobiles lg:text-sm">
              {modeCard === "STATS" &&
                subControl([
                  "STATS_ACTIVE",
                  "STATS_DEATH",
                  "STATS_RECOVERED",
                  "STATS_CONFIRMED",
                  "STATS_TOTAL_OBS",
                  "STATS_HOSOBS",
                  "STATS_HOME_OBS",
                  "STATS_HOSTODAY",
                ])}
            </div>
          )}
          {controlTip && (
            <div
              className={`flex text-mobilexs lg:text-mobile p-sm bg-opacity-50 self-start ${
                dark ? "bg-black" : "bg-white"
              }`}
            >
              {controlTip}
            </div>
          )}
        </div>
      )
    );
  };

  const header = () => {
    let h = mode <= MODE.STATS_CONFIRMED ? "STATS" : "CONTAINMENT";
    let sh = MODE_SUBHEADER_LANG.find((j) => j[0] === mode)[1].toString();
    return (
      <div className="flex flex-col mb-2">
        <div className="flex font-extrabold">{h}</div>
        <div className="flex text-mobiles lg:text-mobilel">{sh}</div>
      </div>
    );
  };

  return (
    <div className="absolute z-40 flex flex-row w-40 lg:w-64">
      <div className="flex flex-col flex-grow w-full m-2 select-none">
        <div
          className={`w-24 lg:w-48 relative ${
            dark ? "text-white" : "text-black"
          }`}
        >
          <Plus
            className={
              "absolute top-0 left-0 z-50 cursor-pointer pointer-events-auto text-white transition duration-150 ease-in-out transform -translate-y-1 -translate-x-1 hover:scale-150 " +
              ((cardEnabled || geolocatedLoc) && "rotate-45")
            }
            size={"0.5rem"}
            onClick={() => {
              setCardEnabled(!cardEnabled);
            }}
          />
          {(cardEnabled || geolocatedLoc) && (
            <div
              className={`flex flex-col text-mobile lg:text-sm p-2 bg-opacity-50 mb-1 ${
                dark ? "bg-black" : "bg-white"
              } `}
            >
              {mode === MODE.CONTAINMENT && (
                <div className="flex flex-col">
                  {header()}
                  {!geolocatedLoc ? (
                    <div className="flex flex-col">
                      {hoveredEntity && hoveredEntity.p ? (
                        <div>
                          {info(hoveredEntity.p, hoveredEntity.z)}
                          <div className="text-mobilexs lg:text-mobile">
                            Hover/select an area for detailed information.
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col mb-2 uppercase">
                          {Object.entries(lens).map((a, i) => (
                            <div key={i}>
                              <div
                                className={`text-mobiles lg:text-xs ${
                                  ZONE.COLOR_TEXT[a[0]]
                                }`}
                              >{`${
                                a[0] == "CONTAINMENT" ? "LSGD" : "DISTRICTS"
                              } IN ${a[0]}`}</div>
                              <div className="font-semibold text-mobile lg:text-sm">
                                {a[1]}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <div className="flex flex-col mb-2">
                        <div className="font-semibold uppercase">
                          You are in
                        </div>
                        <div
                          className={`flex text-mobilel lg:text-base font-semibold ${
                            ZONE.COLOR_TEXT[geolocatedLoc.z]
                          }`}
                        >
                          {`${geolocatedLoc.z} ZONE`}
                        </div>
                        {/* <Link
                        className="flex mt-0 uppercase pointer-events-auto text-mobiles"
                        href={"/info#zone-" + geolocatedLoc.z.toLowerCase()}
                      >
                        Click here for more info
                      </Link> */}
                      </div>
                      {info(geolocatedLoc.p, geolocatedLoc.z)}
                      <div
                        className="uppercase cursor-pointer pointer-events-auto text-mobilexs lg:text-mobiles"
                        onClick={() => setGeolocatedLoc(null)}
                      >
                        CLICK TO RETURN
                      </div>
                    </div>
                  )}
                </div>
              )}
              {mode <= MODE.STATS_CONFIRMED && (
                <div className="flex flex-col">
                  {header()}
                  {hoveredEntity && hoveredEntity.p ? (
                    info(hoveredEntity.p, hoveredEntity.z)
                  ) : (
                    <div className="flex flex-col mb-2 uppercase">
                      {statsinfo()}
                    </div>
                  )}
                  <div className="text-mobilexs lg:text-mobile">
                    Hover/select a point for detailed information.
                  </div>
                </div>
              )}
            </div>
          )}
          {control()}
        </div>
      </div>
    </div>
  );
}
