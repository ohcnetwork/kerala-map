import React from "react";
import ReactDOM from "react-dom";
import { register } from "register-service-worker";
import App from "./App";
import "./assets/styles/tailwind.css";
import { AuthProvider } from "./context/AuthContext";
import { GeoProvider } from "./context/GeoContext";
import { HoveredProvider } from "./context/HoveredContext";
import { ModalProvider } from "./context/ModalContext";
import { ModeProvider } from "./context/ModeContext";
import { ThemeProvider } from "./context/ThemeContext";

ReactDOM.render(
  <React.StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <ModeProvider>
          <GeoProvider>
            <HoveredProvider>
              <ModalProvider>
                <App />
              </ModalProvider>
            </HoveredProvider>
          </GeoProvider>
        </ModeProvider>
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

register(process.env.PUBLIC_URL + "service-worker.js", {
  ready(registration) {
    console.log("Service worker is active.");
  },
  registered(registration) {
    console.log("Service worker has been registered.");
  },
  cached(registration) {
    console.log("Content has been cached for offline use.");
  },
  updatefound(registration) {
    console.log("New content is downloading.");
  },
  updated(registration) {
    console.log("New content is available; please refresh.");
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      window.location.reload();
    });
  },
  offline() {
    console.log(
      "No internet connection found. App is running in offline mode."
    );
  },
  error(error) {
    console.error("Error during service worker registration:", error);
  },
});
