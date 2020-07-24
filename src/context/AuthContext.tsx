import React, { useMemo, useState } from "react";

const ACCESS_TOKEN = "access_token";

export const AuthContext = React.createContext(null);

export const AuthProvider = ({ children }) => {
  let token = localStorage.getItem(ACCESS_TOKEN);
  let logged = token ? true : false;

  const [auth, setAuth] = useState({ logged, token });

  function login(token) {
    localStorage.setItem(ACCESS_TOKEN, token);
    setAuth({ logged: true, token });
  }

  function logout() {
    localStorage.removeItem(ACCESS_TOKEN);
    setAuth({ logged: false, token: "" });
  }

  const value = useMemo(
    () => ({
      auth,
      login,
      logout,
    }),
    [auth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
