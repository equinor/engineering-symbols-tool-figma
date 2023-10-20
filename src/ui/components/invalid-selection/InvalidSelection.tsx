import React from "react";
import "./InvalidSelection.css";
import Warning from "./Warning.svg?react";

export function InvalidSelection() {
  return (
    <div className="container">
      <Warning fill="#f24822" scale={1} strokeWidth={0} />
      <h1>Invalid Selection</h1>
      <p>Select a single Frame that contains a Group named 'Design'</p>
    </div>
  );
}
