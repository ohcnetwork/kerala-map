import React, { useMemo, useState } from "react";

export const ModalContext = React.createContext(null);

export const ModalProvider = ({ children }) => {
  const [modal, setModal] = useState({
    show: false,
    action: "login",
    description: {},
  });

  const value = useMemo(
    () => ({
      modal,
      setModal,
    }),
    [modal]
  );

  return (
    <ModalContext.Provider value={value}>{children}</ModalContext.Provider>
  );
};
