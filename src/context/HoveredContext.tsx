import React, { useMemo, useState } from "react";

export const HoveredContext = React.createContext(null);

export const HoveredProvider = ({ children }) => {
  const [hoveredEntity, setHoveredEntity] = useState(null);

  const value = useMemo(
    () => ({
      hoveredEntity,
      setHoveredEntity,
    }),
    [hoveredEntity]
  );

  return (
    <HoveredContext.Provider value={value}>{children}</HoveredContext.Provider>
  );
};
