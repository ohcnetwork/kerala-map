import React, {
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
  useMemo,
} from "react";

function usePrevious(theme: string) {
  const ref = useRef<string>();
  useEffect(() => {
    ref.current = theme;
  });
  return ref.current;
}

function useStorageTheme(
  key: string
): [boolean, React.Dispatch<React.SetStateAction<boolean>>] {
  const [dark, setDark] = useState(true);
  useEffect(() => {
    localStorage.setItem(key, dark ? "dark" : "light");
  }, [dark, key]);
  return [dark, setDark];
}

export const ThemeContext = React.createContext(null);

export const ThemeProvider = ({ children }) => {
  const [dark, setDark] = useStorageTheme("theme");

  const oldTheme = usePrevious(dark ? "dark" : "light");

  useLayoutEffect(() => {
    document.documentElement.classList.remove(`theme-${oldTheme}`);
    document.documentElement.classList.add(`theme-${dark ? "dark" : "light"}`);
  }, [dark, oldTheme]);

  function toggleDark() {
    setDark(!dark);
  }

  const value = useMemo(
    () => ({
      dark,
      toggleDark,
    }),
    [dark]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
