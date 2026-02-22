import React from "react";
import ReactDOM from "react-dom/client";
import OBR from "@owlbear-rodeo/sdk";
import { Popover } from "./Popover";
import "./popover.css";

// Wait for OBR SDK to be ready
OBR.onReady(async () => {
  console.log("[DH] Popover initializing");

  const root = ReactDOM.createRoot(
    document.getElementById("popover-root") as HTMLElement
  );

  root.render(
    <React.StrictMode>
      <Popover />
    </React.StrictMode>
  );
});
