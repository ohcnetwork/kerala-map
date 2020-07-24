import React, { useContext, useState } from "react";
import { Edit, Plus } from "react-feather";
import {
  MODE,
  MODE_BUTTON,
  MODE_LANG,
  MODE_SUBHEADER_LANG,
  STATS,
  ZONE,
} from "../constants";
import { AuthContext } from "../context/AuthContext";
import { GeoContext } from "../context/GeoContext";
import { HoveredContext } from "../context/HoveredContext";
import { ModalContext } from "../context/ModalContext";
import { ModeContext } from "../context/ModeContext";
import { ThemeContext } from "../context/ThemeContext";

export default function Card({ stats, zones, descriptions }) {
  const { mode, setMode } = useContext(ModeContext);
  const { setModal } = useContext(ModalContext);
  const { dark } = useContext(ThemeContext);
  const { auth } = useContext(AuthContext);
  const { geolocatedLoc, setGeolocatedLoc } = useContext(GeoContext);
  const { hoveredEntity } = useContext(HoveredContext);

  const [cardEnabled, setCardEnabled] = useState(true);
  const [modeCard, setModeCard] = useState("");
  const [controlTip, setControlTip] = useState("");

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
    let desc = descriptions.find(
      (e) => e.lsgd === p.LSGD && e.district === p.DISTRICT
    );
    return (
      <div className="flex flex-col mb-2 uppercase">
        <div className="mb-2">
          <div>
            <div className="text-mobiles lg:text-xs">DISTRICT</div>
            <div className="font-semibold text-mobile lg:text-sm">
              {p.DISTRICT}
            </div>
          </div>
          {p.LSGD && (
            <div>
              <div className="text-mobiles lg:text-xs">LSGD</div>
              <div className="font-semibold text-mobile lg:text-sm">
                {p.LSGD}
              </div>
              <div className="text-mobiles lg:text-xs">WARDS</div>
              <div className="font-semibold text-mobile lg:text-sm">
                {zones.hotspots.find(
                  (e) => e.lsgd === p.LSGD && e.district === p.DISTRICT
                )?.wards || "-"}
              </div>
              <div className="flex items-center content-center text-mobiles lg:text-xs ">
                DESCRIPTION
                {auth.logged && (
                  <Edit
                    className="w-3 ml-2 cursor-pointer pointer-events-auto"
                    onClick={() => {
                      setModal({
                        show: true,
                        action: "update",
                        description: {
                          id: desc?.ID || 0,
                          lsgd: p.LSGD,
                          district: p.DISTRICT,
                          data: desc?.data || "",
                        },
                      });
                    }}
                  />
                )}
              </div>
              <p className="w-24 pr-4 font-semibold break-all text-mobile lg:text-sm lg:w-48">
                {desc?.data || "-"}
              </p>
            </div>
          )}
        </div>
        {distStats(p.DISTRICT)}
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
          <div className="grid grid-flow-col-dense gap-1 mb-1 font-semibold leading-none text-center text-mobiles lg:text-sm">
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
            <div className="grid grid-flow-col-dense grid-cols-none grid-rows-4 gap-1 mb-1 font-semibold leading-none text-center text-mobiles lg:text-sm">
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
      <div className="flex flex-col flex-grow w-full m-2 pointer-events-none select-none">
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
                          <div>
                            <div
                              className={`text-mobiles lg:text-xs ${ZONE.COLOR_TEXT.CONTAINMENT}`}
                            >
                              LSGDs IN CONTAINMENT
                            </div>
                            <div className="font-semibold text-mobile lg:text-sm">
                              {zones.hotspots.length}
                            </div>
                          </div>
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
