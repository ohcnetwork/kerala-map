import React, { useState } from "react";
import { Plus } from "react-feather";
import {
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
    let hos = data.features.length;
    let icu_current = data.features.reduce(
      (a, r) => a + r.properties.icu_current,
      0
    );
    let icu_total = data.features.reduce(
      (a, r) => a + r.properties.icu_total,
      0
    );
    let ventilator_current = data.features.reduce(
      (a, r) => a + r.properties.ventilator_current,
      0
    );
    let ventilator_total = data.features.reduce(
      (a, r) => a + r.properties.ventilator_total,
      0
    );
    return (
      <div className="flex flex-col uppercase mb-2">
        <div>
          <div className="text-mobiles lg:text-xs">NO OF HOSPITALS</div>
          <div className="font-semibold text-mobile lg:text-sm">{hos}</div>
        </div>
        <div>
          <div className="text-mobiles lg:text-xs">ICU CAPACITY</div>
          <div className="font-semibold text-mobile lg:text-sm">
            {icu_current}/{icu_total}
          </div>
        </div>
        <div>
          <div className="text-mobiles lg:text-xs">VENTILATOR CAPACITY</div>
          <div className="font-semibold text-mobile lg:text-sm">
            {ventilator_current}/{ventilator_total}
          </div>
        </div>
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
        className={`text-mobilexs lg:text-xs pointer-events-auto cursor-pointer bg-opacity-50 font-semibold leading-none p-sm ${
          dark ? "bg-black" : "bg-white"
        }`}
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
      <div className="flex flex-col">
        <div className="grid grid-flow-row-dense grid-flow-col-dense gap-1 text-center mb-1 font-semibold text-mobiles lg:text-sm leading-none text-center">
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
        <div className="grid grid-flow-row-dense grid-flow-col-dense gap-1 grid-cols-none grid-rows-4 text-center mb-1 font-semibold text-mobiles lg:text-sm leading-none text-center">
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
            subControl(["CARE_ICU", "CARE_VENTILATOR", "CARE_HOSPITALS"])}
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
        {(cardEnabled || geolocatedLoc || careData.showLogin) && (
          <div
            className={`flex flex-col text-mobile lg:text-sm p-2 bg-opacity-50 mb-1 ${
              dark ? "bg-black" : "bg-white"
            } `}
          >
            {!careData.showLogin ? (
              <div>
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
                          <div className="uppercase font-semibold">
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
                {(mode === MODE.CARE_ICU ||
                  mode === MODE.CARE_VENTILATOR ||
                  mode === MODE.CARE_HOSPITALS) && (
                  <div className="flex flex-col">
                    {header()}
                    <div
                      className="text-mobiles lg:text-mobilel absolute top-0 right-0 p-2 pointer-events-auto cursor-pointer"
                      onClick={logout}
                    >
                      LOGOUT
                    </div>
                    {hoveredEntity && hoveredEntity.name ? (
                      <div className="flex flex-col uppercase mb-2">
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
                        {hoveredEntity.icu_total !== 0 && (
                          <div>
                            <div className="text-mobiles lg:text-xs">
                              ICU CAPACITY
                            </div>
                            <div className="font-semibold text-mobile lg:text-sm">
                              {hoveredEntity.icu_current}/
                              {hoveredEntity.icu_total}
                            </div>
                          </div>
                        )}
                        {hoveredEntity.ventilator_total !== 0 && (
                          <div>
                            <div className="text-mobiles lg:text-xs">
                              VENTILATOR CAPACITY
                            </div>
                            <div className="font-semibold text-mobile lg:text-sm">
                              {hoveredEntity.ventilator_current}/
                              {hoveredEntity.ventilator_total}
                            </div>
                          </div>
                        )}
                        <div className="text-mobiles lg:text-xs mt-2">
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
                      className="font-semibold text-mobile lg:text-sm w-full bg-transparent"
                      id="username"
                      type="text"
                      placeholder="USERNAME"
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <div className="text-mobiles lg:text-xs">PASSWORD</div>
                    <input
                      className="font-semibold text-mobile lg:text-sm w-full bg-transparent"
                      id="password"
                      type="password"
                      placeholder="*******"
                      onChange={handleChange}
                      autoComplete="off"
                    />
                  </div>
                  <button
                    className="font-semibold text-mobiles lg:text-sm leading-none text-center"
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
  );
}
