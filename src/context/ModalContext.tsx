import React, { useMemo, useState } from "react";
import { MODAL_ACTION } from "../constants";

export const ModalContext = React.createContext(null);

export const ModalProvider = ({ children }) => {
  const [modal, setModal] = useState({
    show: false,
    action: MODAL_ACTION.LOGIN,
    payload: {},
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
