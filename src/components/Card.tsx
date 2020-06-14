import React, { useState } from "react";
import { Plus } from "react-feather";
import {
  CARE_KEY,
  DISTRICTS,
  MODE,
  MODE_BUTTON,
  MODE_DEFAULT,
  MODE_LANG,
  MODE_SUBHEADER_LANG,
  STATS,
  ZONE,
} from "../constants";
import { careLogin, getCareStats } from "../requests";

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
  setCare,
  showHotspot2D,
  setShowHotspot2D,
  filter,
  setFilter,
}) {
  const lens = {
    CONTAINMENT: zones.hotspots.length,
    RED: Object.values(zones.districts).filter((x) => x == "red").length,
    ORANGE: Object.values(zones.districts).filter((x) => x == "orange").length,
    GREEN: Object.values(zones.districts).filter((x) => x == "green").length,
  };
  const [cardEnabled, setCardEnabled] = useState(true);
  const [filterCardEnabled, setfilterCardEnabled] = useState(false);
  const [modeCard, setModeCard] = useState("");
  const [controlTip, setControlTip] = useState("");
  const initCareData = {
    showLogin: false,
    mode: MODE.CARE_HOSPITALS,
    loginInfo: "",
    formData: {
      username: "",
      password: "",
    },
  };
  const [careData, setCareData] = useState(initCareData);

  const handleChange = (e: any) => {
    const { value, id } = e.target;
    const fieldValue = Object.assign({}, careData.formData);
    fieldValue[id] = value;
    if (id === "username") {
      fieldValue[id] = value.toLowerCase();
    }
    setCareData({ ...careData, formData: fieldValue });
  };

  const validateData = () => {
    let err = "";
    err =
      !careData.formData.password || !careData.formData.username
        ? "Provide valid credentials"
        : "";
    if (err) {
      setCareData({ ...careData, loginInfo: err });
      return false;
    }
    return true;
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (validateData()) {
      (async () => {
        try {
          await careLogin(careData.formData);
          let { hospitals } = await getCareStats();
          setCare({ hospitals: hospitals });
          setCareData(initCareData);
          setMode(careData.mode);
        } catch (error) {
          setCareData({ ...careData, loginInfo: error.toString() });
        }
      })();
    }
  };

  const logout = (e: any) => {
    localStorage.removeItem("care_access_token");
    localStorage.removeItem("care_refresh_token");
    setCare({ hospitals: {} });
    setMode(MODE_DEFAULT);
  };

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

  const info = (p, z, f) => {
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
    let data = care.hospitals;
    let hos = data.features.filter(({ properties }) => {
      if (
        [
          MODE.CARE_VENTILATOR,
          MODE.CARE_ICU,
          MODE.CARE_BED,
          MODE.CARE_ROOM,
        ].includes(mode)
      ) {
        return (
          properties[CARE_KEY.find((j) => j[0] === mode)[1] + "_total"] !== 0
        );
      }
      return true;
    }).length;

    return (
      <div className="flex flex-col mb-2 uppercase">
        <div>
          <div className="text-mobiles lg:text-xs">NO OF HOSPITALS</div>
          <div className="font-semibold text-mobile lg:text-sm">
            {hos}/{care.hospitals.features.length}
          </div>
        </div>
        {CARE_KEY.map((e, i) => (
          <div key={i}>
            <div className="text-mobiles lg:text-xs">
              {e[1].toString().toUpperCase() + " CAPACITY"}
            </div>
            <div className="font-semibold text-mobile lg:text-sm">
              {data.features.reduce(
                (a, r) => a + r.properties[e[1] + "_current"],
                0
              )}
              /
              {data.features.reduce(
                (a, r) => a + r.properties[e[1] + "_total"],
                0
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const changeMode = (m: number) => {
    if (m >= 10 && !localStorage.getItem("care_access_token")) {
      setCareData({ ...careData, showLogin: true, mode: m });
    } else {
      careData.showLogin && setCareData(initCareData);
      setMode(m);
    }
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
            {["STATS", "ZONES", "CARE"].map((a, i) => (
              <div
                key={i}
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
            {modeCard === "ZONES" &&
              subControl(["HOTSPOTS_LSGD", "HOTSPOTS_DISTRICT"])}
            {modeCard === "CARE" &&
              subControl([
                "CARE_ICU",
                "CARE_VENTILATOR",
                "CARE_BED",
                "CARE_ROOM",
                "CARE_HOSPITALS",
              ])}
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
      )
    );
  };

  const header = () => {
    let h =
      mode <= MODE.STATS_CONFIRMED
        ? "STATS"
        : mode <= MODE.HOTSPOTS_DISTRICT
        ? "ZONE"
        : "CARE";
    let sh = MODE_SUBHEADER_LANG.find((j) => j[0] === mode)[1].toString();
    return (
      <div className="flex flex-col mb-2">
        <div className="flex font-extrabold">{h}</div>
        <div className="flex text-mobiles lg:text-mobilel">{sh}</div>
      </div>
    );
  };

  const filterCard = () => {
    return (
      <div
        className={`flex flex-col text-mobilexs order-last lg:text-mobilel p-2 bg-opacity-50 my-2 h-full w-full ${
          dark ? "bg-black text-white" : "bg-white text-black"
        } `}
      >
        <div className="flex flex-col w-full">
          <div className="mb-1 font-bold">FILTER BY DISTRICTS</div>
          {DISTRICTS.map((d) => {
            return (
              <div className="flex flex-row items-center">
                <div
                  className={`${
                    filter.includes(d) ? "bg-green-500 " : "bg-white "
                  } flex w-1 h-1 lg:h-2 lg:w-2 my-1 mr-1  cursor-pointer
                `}
                  onClick={() => {
                    if (filter.includes(d)) {
                      setFilter(filter.filter((i) => i != d));
                    } else {
                      setFilter(filter.concat([d]));
                    }
                  }}
                ></div>
                <div className="leading-none">{d}</div>
              </div>
            );
          })}
          <div className="mt-1">
            <div
              className="cursor-pointer"
              onClick={() => {
                setFilter(DISTRICTS);
              }}
            >
              SELECT ALL
            </div>
            <div
              className="cursor-pointer"
              onClick={() => {
                setFilter([]);
              }}
            >
              SELECT NONE
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="absolute z-40 flex flex-row w-40 lg:w-64">
      {[
        MODE.CARE_VENTILATOR,
        MODE.CARE_ICU,
        MODE.CARE_BED,
        MODE.CARE_ROOM,
        MODE.CARE_HOSPITALS,
      ].includes(mode) &&
        cardEnabled &&
        filterCardEnabled &&
        filterCard()}
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
          {(cardEnabled || geolocatedLoc || careData.showLogin) && (
            <div
              className={`flex flex-col text-mobile lg:text-sm p-2 bg-opacity-50 mb-1 ${
                dark ? "bg-black" : "bg-white"
              } `}
            >
              {!careData.showLogin ? (
                <div>
                  {[MODE.HOTSPOTS_DISTRICT, MODE.HOTSPOTS_LSGD].includes(
                    mode
                  ) && (
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
                          {info(geolocatedLoc.p, geolocatedLoc.z, false)}
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
                  {[
                    MODE.CARE_VENTILATOR,
                    MODE.CARE_ICU,
                    MODE.CARE_BED,
                    MODE.CARE_ROOM,
                    MODE.CARE_HOSPITALS,
                  ].includes(mode) && (
                    <div className="flex flex-col">
                      {header()}
                      <div className="absolute top-0 right-0 p-2 text-right text-mobiles lg:text-mobilel">
                        <div
                          className="cursor-pointer pointer-events-auto"
                          onClick={logout}
                        >
                          LOGOUT
                        </div>
                        <div
                          className={`cursor-pointer pointer-events-auto ${
                            showHotspot2D ? "text-green-500" : "text-red-500"
                          }`}
                          onClick={() => {
                            setShowHotspot2D(!showHotspot2D);
                          }}
                        >
                          HOTSPOTS
                        </div>
                        <div
                          className={`cursor-pointer pointer-events-auto ${
                            filterCardEnabled
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                          onClick={() => {
                            setfilterCardEnabled(!filterCardEnabled);
                          }}
                        >
                          FILTER
                        </div>
                      </div>
                      {hoveredEntity && hoveredEntity.name ? (
                        <div className="flex flex-col mb-2 uppercase">
                          <div>
                            <div className="text-mobiles lg:text-xs">NAME</div>
                            <div className="font-semibold text-mobile lg:text-sm">
                              {hoveredEntity.name}
                            </div>
                          </div>
                          <div>
                            <div className="text-mobiles lg:text-xs">
                              ADDRESSS
                            </div>
                            <div className="font-semibold text-mobile lg:text-sm">
                              {hoveredEntity.address}
                            </div>
                          </div>
                          <div>
                            <div className="text-mobiles lg:text-xs">
                              PHONENO
                            </div>
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
                          {CARE_KEY.map((e, i) => (
                            <div key={i}>
                              {hoveredEntity[e[1] + "_total"] !== 0 && (
                                <div>
                                  <div className="text-mobiles lg:text-xs">
                                    {e[1].toString().toUpperCase() +
                                      " CAPACITY"}
                                  </div>
                                  <div className="font-semibold text-mobile lg:text-sm">
                                    {hoveredEntity[e[1] + "_current"]}/
                                    {hoveredEntity[e[1] + "_total"]}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                          <div className="mt-2 text-mobiles lg:text-xs">
                            DISTRICT STATS
                          </div>
                          {distStats(hoveredEntity.district)}
                        </div>
                      ) : (
                        hosinfo()
                      )}
                      <div className="text-mobilexs lg:text-mobile">
                        Hover/select a point for detailed information.
                      </div>
                    </div>
                  )}
                  {mode <= MODE.STATS_CONFIRMED && (
                    <div className="flex flex-col">
                      {header()}
                      {hoveredEntity && hoveredEntity.p ? (
                        info(hoveredEntity.p, hoveredEntity.z, true)
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
              ) : (
                <div className="flex flex-col">
                  <div className="flex flex-col mb-2">
                    <div className="flex font-extrabold">CARE</div>
                    <div className="flex text-mobiles lg:text-mobilel">
                      LOGIN WITH CARE CREDENTIALS
                    </div>
                  </div>
                  <form className="pointer-events-auto" onSubmit={handleSubmit}>
                    <div>
                      <div className="text-mobiles lg:text-xs">USERNAME</div>
                      <input
                        className="w-full font-semibold bg-transparent text-mobile lg:text-sm"
                        id="username"
                        type="text"
                        placeholder="USERNAME"
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <div className="text-mobiles lg:text-xs">PASSWORD</div>
                      <input
                        className="w-full font-semibold bg-transparent text-mobile lg:text-sm"
                        id="password"
                        type="password"
                        placeholder="*******"
                        onChange={handleChange}
                        autoComplete="off"
                      />
                    </div>
                    <button
                      className="font-semibold leading-none text-center text-mobiles lg:text-sm"
                      type="submit"
                    >
                      SIGN IN
                    </button>
                    <div className="text-mobilexs lg:text-mobile">
                      {careData.loginInfo}
                    </div>
                  </form>
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
