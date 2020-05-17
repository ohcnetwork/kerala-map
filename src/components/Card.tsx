import React, { useState } from "react";
import { Plus } from "react-feather";
import { MODE, MODE_LANG, ZONE } from "../constants";

export default function Card({
  mode,
  setMode,
  dark,
  stats,
  zones,
  care,
  hoveredEntity,
  geolocatedLoc,
  setGeolocatedLoc,
}) {
  const lens = {
    CONTAINMENT: zones.hotspots.length,
    RED: Object.values(zones.districts).filter((x) => x == "red").length,
    ORANGE: Object.values(zones.districts).filter((x) => x == "orange").length,
    GREEN: Object.values(zones.districts).filter((x) => x == "green").length,
  };
  const [cardEnabled, setCardEnabled] = useState(true);
  const [modeCard, setModeCard] = useState("");
  const [controlTip, setControlTip] = useState("");

  const distStats = (d) => {
    return ["confirmed", "recovered", "deceased", "active"].map((a) => (
      <div>
        <div className="text-mobiles lg:text-xs">{a}</div>
        <div className="font-semibold text-mobile lg:text-sm">
          {stats.latest[d][a]}
        </div>
      </div>
    ));
  };

  const statsinfo = () => {
    return ["confirmed", "recovered", "deceased", "active"].map((a) => (
      <div>
        <div className="text-mobiles lg:text-xs">{a}</div>
        <div className="font-semibold text-mobile lg:text-sm">
          {stats.summary[a]}
        </div>
      </div>
    ));
  };

  const info = (p, z, f) => {
    return (
      <div className="flex flex-col uppercase mb-2">
        <div className="mb-2">
          {p.LSGD && (
            <div>
              <div className="text-mobiles lg:text-xs">LSGD</div>
              <div className="font-semibold text-mobile lg:text-sm">
                {p.LSGD}
              </div>
            </div>
          )}
          <div>
            <div className="text-mobiles lg:text-xs">DISTRICT</div>
            <div className="font-semibold text-mobile lg:text-sm">
              {p.DISTRICT}
            </div>
          </div>
          {f && (
            <div>
              <div className="text-mobiles lg:text-xs">ZONE</div>
              <div
                className={`font-semibold text-mobile lg:text-sm ${ZONE.COLOR_TEXT[z]}`}
              >
                {z}
              </div>
            </div>
          )}
        </div>
        {distStats(p.DISTRICT)}
      </div>
    );
  };

  const hosinfo = () => {
    let data = mode === MODE.CARE_VENTILATOR ? care.ventilators : care.icus;
    let hos = data.features.length;
    let total = data.features.reduce((a, r) => a + r.properties.total, 0);
    let current = data.features.reduce((a, r) => a + r.properties.current, 0);
    return (
      <div className="flex flex-col uppercase mb-2">
        <div>
          <div className="text-mobiles lg:text-xs">NO OF HOSPITALS</div>
          <div className="font-semibold text-mobile lg:text-sm">{hos}</div>
        </div>
        <div>
          <div className="text-mobiles lg:text-xs">CURRENT CAPACITY</div>
          <div className="font-semibold text-mobile lg:text-sm">{current}</div>
        </div>
        <div>
          <div className="text-mobiles lg:text-xs">TOTAL CAPACITY</div>
          <div className="font-semibold text-mobile lg:text-sm">{total}</div>
        </div>
      </div>
    );
  };

  const subControl = (l: string[]) => {
    return l.map((a) => (
      <div
        className={`text-mobilexs lg:text-xs pointer-events-auto cursor-pointer bg-opacity-50 font-semibold leading-none p-sm ${
          dark ? "bg-black" : "bg-white"
        }`}
        onClick={() => setMode(MODE[a])}
        onMouseEnter={() =>
          setControlTip(MODE_LANG.find((j) => j[0] === MODE[a])[1].toString())
        }
        onMouseLeave={() => setControlTip("")}
      >
        {a.split("_")[1]}
      </div>
    ));
  };

  const control = () => {
    return (
      <div className="flex flex-col">
        <div className="grid grid-flow-row-dense grid-flow-col-dense gap-1 text-center mb-1 font-semibold text-mobiles lg:text-sm leading-none text-center">
          {["STATS", "ZONES", "CARE"].map((a) => (
            <div
              className={`pointer-events-auto cursor-pointer bg-opacity-50 p-sm ${
                dark ? "bg-black" : "bg-white"
              }`}
              onClick={() =>
                modeCard
                  ? modeCard === a
                    ? setModeCard("")
                    : setModeCard(a)
                  : setModeCard(a)
              }
            >
              {a}
            </div>
          ))}
        </div>
        <div className="grid grid-flow-row-dense grid-flow-col-dense gap-1 text-center mb-1 font-semibold text-mobiles lg:text-sm leading-none text-center">
          {modeCard === "STATS" &&
            subControl([
              "STATS_ACTIVE",
              "STATS_DEATH",
              "STATS_RECOVERED",
              "STATS_CONFIRMED",
            ])}
          {modeCard === "ZONES" &&
            subControl(["HOTSPOTS_LSGD", "HOTSPOTS_DISTRICT"])}
          {modeCard === "CARE" && subControl(["CARE_ICU", "CARE_VENTILATOR"])}
        </div>
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
    );
  };

  const header = () => {
    let h = "";
    let sh = "";
    if (mode <= MODE.STATS_CONFIRMED) {
      h = "STATS";
      sh =
        mode === MODE.STATS_ACTIVE
          ? "ACTIVE CASES"
          : mode === MODE.STATS_CONFIRMED
          ? "CONFIRMED CASES"
          : mode === MODE.STATS_DEATH
          ? "DECEASED CASES"
          : "RECOVERED CASES";
    } else if (mode <= 5) {
      h = "ZONE";
      sh =
        mode === MODE.HOTSPOTS_DISTRICT
          ? "DISTRICT ZONES"
          : "HOTSPOTS AND LSGD ZONES";
    } else {
      h = "CARE";
      sh = mode === MODE.CARE_ICU ? "ICU CAPACITY" : "VENTILATOR CAPACITY";
    }
    return (
      <div className="flex flex-col mb-2">
        <div className="flex font-extrabold">{h}</div>
        <div className="flex text-mobiles lg:text-mobilel">{sh}</div>
      </div>
    );
  };

  return (
    <div className="absolute flex flex-col flex-grow order-last lg:order-first z-40 m-2 z-40 select-none pointer-events-none w-24 lg:w-48">
      <div
        className={`max-w-full relative ${dark ? "text-white" : "text-black"}`}
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
            {(mode === MODE.HOTSPOTS_DISTRICT ||
              mode === MODE.HOTSPOTS_LSGD) && (
              <div className="flex flex-col">
                {header()}
                {!geolocatedLoc ? (
                  <div className="flex flex-col">
                    {hoveredEntity && hoveredEntity.p ? (
                      <div>
                        {info(hoveredEntity.p, hoveredEntity.z, true)}
                        <div className="text-mobilexs lg:text-mobile">
                          Hover/select an area for detailed information.
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col uppercase mb-2">
                        {Object.entries(lens).map((a) => (
                          <div>
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
                      <div className="uppercase font-semibold">You are in</div>
                      <div
                        className={`flex text-mobilel lg:text-base font-semibold ${
                          ZONE.COLOR_TEXT[geolocatedLoc.z]
                        }`}
                      >
                        {`${geolocatedLoc.z} ZONE`}
                      </div>
                      {/* <Link
                        className="flex uppercase text-mobiles mt-0 pointer-events-auto"
                        href={"/info#zone-" + geolocatedLoc.z.toLowerCase()}
                      >
                        Click here for more info
                      </Link> */}
                    </div>
                    {info(geolocatedLoc.p, geolocatedLoc.z, false)}
                    <div
                      className="uppercase text-mobilexs lg:text-mobiles pointer-events-auto cursor-pointer"
                      onClick={() => setGeolocatedLoc(null)}
                    >
                      CLICK TO RETURN
                    </div>
                  </div>
                )}
              </div>
            )}
            {(mode === MODE.CARE_ICU || mode === MODE.CARE_VENTILATOR) && (
              <div className="flex flex-col">
                {header()}
                {hoveredEntity && hoveredEntity.name ? (
                  <div className="flex flex-col uppercase mb-2">
                    <div>
                      <div className="text-mobiles lg:text-xs">NAME</div>
                      <div className="font-semibold text-mobile lg:text-sm">
                        {hoveredEntity.name}
                      </div>
                    </div>
                    <div>
                      <div className="text-mobiles lg:text-xs">ADDRESSS</div>
                      <div className="font-semibold text-mobile lg:text-sm">
                        {hoveredEntity.address}
                      </div>
                    </div>
                    <div>
                      <div className="text-mobiles lg:text-xs">PHONENO</div>
                      <div className="font-semibold text-mobile lg:text-sm">
                        {hoveredEntity.phoneNo}
                      </div>
                    </div>
                    <div>
                      <div className="text-mobiles lg:text-xs">TYPE</div>
                      <div className="font-semibold text-mobile lg:text-sm">
                        {hoveredEntity.type}
                      </div>
                    </div>
                    <div>
                      <div className="text-mobiles lg:text-xs">CAPACITY</div>
                      <div className="font-semibold text-mobile lg:text-sm">
                        {hoveredEntity.current}/{hoveredEntity.total}
                      </div>
                    </div>
                  </div>
                ) : (
                  hosinfo()
                )}
                <div className="text-mobilexs lg:text-mobile">
                  Hover/select a point for detailed information.
                </div>
              </div>
            )}
            {(mode === MODE.STATS_ACTIVE ||
              mode === MODE.STATS_CONFIRMED ||
              mode === MODE.STATS_DEATH ||
              mode === MODE.STATS_RECOVERED) && (
              <div className="flex flex-col">
                {header()}
                {hoveredEntity && hoveredEntity.p ? (
                  info(hoveredEntity.p, hoveredEntity.z, true)
                ) : (
                  <div className="flex flex-col uppercase mb-2">
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
  );
}
