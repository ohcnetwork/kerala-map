import React, { useMemo, useState } from "react";
import { MODE_DEFAULT } from "../constants";

export const ModeContext = React.createContext(null);

export const ModeProvider = ({ children }) => {
  const [mode, setMode] = useState(MODE_DEFAULT);

  const value = useMemo(
    () => ({
      mode,
      setMode,
    }),
    [mode]
  );

  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>;
};
