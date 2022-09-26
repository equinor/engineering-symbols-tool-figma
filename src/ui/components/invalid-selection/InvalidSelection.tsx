import React, { useRef, useState } from "react";
import "./InvalidSelection.css";
import { ReactComponent as Warning } from "./Warning.svg";

export function InvalidSelection() {
  return (
    <div className="container">
      <Warning fill="#f24822" scale={1} strokeWidth={0} />
      <h1>Invalid Selection</h1>
      <p>
        Select a single Frame that contains two Groups: 'Design' and
        'Annotations'
      </p>
    </div>
  );
}
