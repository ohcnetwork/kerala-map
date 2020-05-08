import React from "react";

export default function Card({
  stats,
  zones,
  hotspots,
  hoveredEntity,
  darkMode,
}) {
  const lens = {
    CONTAINMENT: hotspots.length,
    RED: Object.values(zones).filter((x) => x == "red").length,
    ORANGE: Object.values(zones).filter((x) => x == "orange").length,
    GREEN: Object.values(zones).filter((x) => x == "green").length,
  };
  const color = {
    CONTAINMENT: "text-blue-600",
    RED: "text-red-600",
    ORANGE: "text-orange-600",
    GREEN: "text-green-600",
  };

  const HoveredInfo = () => {
    return (
      <div className="flex flex-col uppercase mb-2">
        <div className="mb-2">
          {hoveredEntity.p.LSGD && (
            <div>
              <div className="text-mobilexs lg:text-xs">LSGD</div>
              <div className="font-semibold">{hoveredEntity.p.LSGD}</div>
            </div>
          )}
          <div>
            <div className="text-mobilexs lg:text-xs">DISTRICT</div>
            <div className="font-semibold">{hoveredEntity.p.DISTRICT}</div>
          </div>
          <div>
            <div className="text-mobilexs lg:text-xs">ZONE</div>
            <div
              className={`font-semibold ${
                hoveredEntity ? color[hoveredEntity.zone] : "text-black"
              }`}
            >
              {hoveredEntity.zone}
            </div>
          </div>
        </div>
        <div>
          <div className="text-mobilexs lg:text-xs">DISTRICT STATS</div>
          <div className="font-semibold">
            {["confirmed", "recovered", "deceased", "active"].map((a) => (
              <div>
                <div className="text-mobilexs lg:text-xs">{a}</div>
                <div className="font-semibold">
                  {stats.latest[hoveredEntity.p.DISTRICT][a]}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`flex flex-col w-27 lg:w-full text-mobile lg:text-sm p-2 m-1 lg:m-2 bg-opacity-50 lg:bg-opacity-0 ${
        darkMode ? "text-white bg-black" : "text-black bg-white"
      }`}
    >
      <div className="flex flex-col uppercase mb-2">
        {Object.entries(lens).map((a) => (
          <div>
            <div className={`text-mobilexs lg:text-xs ${color[a[0]]}`}>{`${
              a[0] == "CONTAINMENT" ? "LSGD" : "DISTRICTS"
            } IN ${a[0]}`}</div>
            <div className="font-semibold">{a[1]}</div>
          </div>
        ))}
      </div>
      {hoveredEntity ? (
        <HoveredInfo />
      ) : (
        <div className="text-mobilexs lg:text-mobile mb-2">
          Hover/select an area for detailed information.
        </div>
      )}
    </div>
  );
}
