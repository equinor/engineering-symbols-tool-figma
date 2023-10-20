import React from "react";

import "./HelpTab.css";
import logo from "./github-mark.png";

export function HelpTab() {
  return (
    <div className="help">
      <div>
        <a
          href="https://github.com/equinor/engineering-symbols-tool-figma"
          target="_blank"
        >
          <img src={logo} width={80} height={80} />
        </a>
      </div>

      <div>
        <br />
        <p>Please checkout the Github repository at </p>
      </div>
      <h3>
        <a
          href="https://github.com/equinor/engineering-symbols-tool-figma"
          target="_blank"
        >
          equinor/engineering-symbols-tool-figma
        </a>
      </h3>
    </div>
  );
}
