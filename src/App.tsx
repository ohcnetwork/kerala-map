import React, { useContext, useEffect, useState } from "react";
import { Activity, ChevronDown, Moon, Sun, User } from "react-feather";
import { hot } from "react-hot-loader";
import MapBox from "./components/MapBox";
import Modal from "./components/Modal";
import { AuthContext } from "./context/AuthContext";
import { ModalContext } from "./context/ModalContext";
import { ThemeContext } from "./context/ThemeContext";
import { getDescriptions, getGeoJSONs, getKeralaStats } from "./requests";

function App() {
  const { auth, logout } = useContext(AuthContext);
  const { dark, toggleDark } = useContext(ThemeContext);
  const { modal, setModal } = useContext(ModalContext);
  const [stats, setStats] = useState({
    latest: {},
    summary: {},
    lastUpdated: "",
  });
  const [zones, setZones] = useState({ hotspots: [] });
  const [descriptions, setDescriptions] = useState([]);
  const [geoJSONs, setGeoJSONs] = useState({ lsgd: null, district: null });
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    if (!fetched) {
      (async () => {
        try {
          let {
            latest,
            summary,
            hotspots,
            lastUpdated,
          } = await getKeralaStats();
          setStats({
            latest: latest,
            summary: summary,
            lastUpdated: lastUpdated,
          });
          setZones({ hotspots: hotspots });
          let { lsgd, district } = await getGeoJSONs();
          setGeoJSONs({ lsgd: lsgd, district: district });
          let _d = await getDescriptions();
          setDescriptions(_d);
          setFetched(true);
        } catch (error) {
          console.error(error);
        }
      })();
    }
  }, [fetched]);

  useEffect(() => {
    if (modal.action == "updateDone") {
      (async () => {
        try {
          let _d = await getDescriptions();
          setDescriptions(_d);
        } catch (error) {
          console.error(error);
        }
      })();
    }
  }, [modal.action]);

  return fetched ? (
    <div
      className={`flex relative min-h-screen min-w-screen overflow-x-hidden antialiased font-inter ${
        dark ? "bg-dark-500" : "bg-light-500"
      }`}
    >
      {modal.show && <Modal />}
      <div
        className={`flex flex-col fixed top-0 right-0 z-40 m-2 items-end uppercase fill-current ${
          dark ? "text-white" : "text-black"
        }`}
      >
        <div className="text-xl font-extrabold leading-none tracking-wider text-right select-none lg:text-3xl">
          KERALA
        </div>
        <div className="flex flex-row items-end object-center select-none text-mobiles lg:text-mobile">
          <p className="flex leading-none">Part of</p>
          <a className="flex w-12 ml-1 lg:" href="https://coronasafe.network/">
            <img
              src={require("./assets/img/coronaSafeLogo.svg")}
              title="CoronaSafe: Corona Literacy Mission"
              alt="CoronaSafe Logo: Corona Literacy Mission"
            />
          </a>
        </div>
        <div className="flex group text-mobiles">
          <div className="flex flex-col items-end mt-1 space-y-1 transition duration-150 ease-in-out origin-right transform scale-0 lg:w-full group-hover:scale-100">
            <div
              className="flex flex-row items-center cursor-pointer"
              onClick={() => {
                if (auth.logged) {
                  logout();
                  setModal({ ...modal, show: false });
                  return;
                }
                setModal({ show: true, action: "login" });
              }}
            >
              {auth.logged ? "Logout" : "Login"}
              <User className="flex ml-1" size={"0.8rem"} />
            </div>
            <a href="/">
              <div className="flex flex-row items-center cursor-pointer">
                Map
                <Activity className="flex ml-1" size={"0.8rem"} />
              </div>
            </a>
            <a href="https://keralamap.coronasafe.network/">
              <div className="flex flex-row items-center cursor-pointer">
                Dashboard
                <Activity className="flex ml-1" size={"0.8rem"} />
              </div>
            </a>
            {dark ? (
              <div
                className="flex flex-row items-center cursor-pointer"
                onClick={() => toggleDark()}
              >
                Light
                <Sun className="flex ml-1" size={"0.8rem"} />
              </div>
            ) : (
              <div
                className="flex flex-row items-center cursor-pointer"
                onClick={() => toggleDark()}
              >
                Dark
                <Moon className="flex ml-1" size={"0.8rem"} />
              </div>
            )}
          </div>
          <ChevronDown
            size={"0.8rem"}
            className="absolute right-0 transition duration-150 ease-in-out transform cursor-pointer group-hover:scale-0"
          />
        </div>
      </div>
      <MapBox
        stats={stats}
        zones={zones}
        geoJSONs={geoJSONs}
        descriptions={descriptions}
      />
    </div>
  ) : (
    <div
      className={`flex h-screen w-screen items-center justify-center overflow-hidden ${
        dark ? "bg-dark-500" : "bg-light-500"
      }`}
    >
      <div className="lds-ripple">
        <div></div>
        <div></div>
      </div>
    </div>
  );
}

export default hot(module)(App);
