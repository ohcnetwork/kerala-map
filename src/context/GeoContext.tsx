import React, { useMemo, useState } from "react";

export const GeoContext = React.createContext(null);

export const GeoProvider = ({ children }) => {
  const [geolocatedLoc, setGeolocatedLoc] = useState(null);

  const value = useMemo(
    () => ({
      geolocatedLoc,
      setGeolocatedLoc,
    }),
    [geolocatedLoc]
  );

  return <GeoContext.Provider value={value}>{children}</GeoContext.Provider>;
};
