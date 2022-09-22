import React, { useContext, useEffect, useRef, useState } from "react";
import "./ExportTab.css";
import { CreateExportVectorAction, PluginAction } from "../../../plugin/types";
import {
  SymbolContext,
  SymbolContextProviderValue,
} from "../../context/SymbolProvider";
import { postMessageToPlugin } from "../../helpers/pluginHelpers";
import { InvalidSelection } from "../invalid-selection";

export function ExportTab() {
  const { symbol, validationErrors, isValid } = useContext(
    SymbolContext
  ) as SymbolContextProviderValue;

  const [canExport, setCanExport] = useState(false);

  useEffect(() => {
    //console.log("symbol?.symbolVectorData", symbol?.symbolVectorData);
    setCanExport(symbol?.symbolVectorData !== undefined && isValid);
  }, [symbol?.symbolVectorData, isValid]);

  const onCreate = () => {
    if (symbol === undefined || symbol.id === undefined) return;
    postMessageToPlugin({
      type: "create-export-vector",
      payload: { nodeId: symbol.id },
    });
  };

  const onExportAsSvg = () => {
    if (symbol === undefined || symbol.id === undefined) return;
    postMessageToPlugin({
      type: "create-export-blob",
      payload: { nodeId: symbol.id },
    });
  };

  const canCreateExportSymbol =
    (validationErrors.length === 1 &&
      validationErrors[0].category === "Export Layer Fill Rule") ||
    isValid;

  if (symbol) {
    return (
      <div className="symbolContainer">
        <div className="content">
          <h1>{symbol.name}</h1>
          <p>
            <span className="secondary-color ">W</span>&nbsp;&nbsp;{" "}
            {symbol.width} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <span className="secondary-color ">H</span>&nbsp;&nbsp;{" "}
            {symbol.width}
          </p>
          {validationErrors.map((e) => {
            return (
              <div className="error-item">
                <h4>{e.category}</h4>
                <p>{e.error}</p>
              </div>
            );
          })}
        </div>
        <div className="buttons">
          <button
            className={canCreateExportSymbol ? "brand" : "brand-disabled"}
            disabled={!canCreateExportSymbol}
            onClick={() => onCreate()}>
            {symbol.symbolVectorData
              ? "Re-Create Export Layer"
              : "Create Export Layer"}
          </button>

          <button
            className={canExport ? "brand" : "brand-disabled"}
            disabled={!canExport}
            onClick={() => onExportAsSvg()}>
            Export As SVG
          </button>
        </div>
      </div>
    );
  }

  if (validationErrors.some((e) => e.category === "Invalid Selection")) {
    return <InvalidSelection />;
  }

  return (
    <div>
      {validationErrors.map((e) => {
        return (
          <p>
            {e.category}: {e.error}
          </p>
        );
      })}
    </div>
  );
}
