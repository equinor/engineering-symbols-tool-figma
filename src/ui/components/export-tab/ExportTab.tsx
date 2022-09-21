import React, { useContext, useEffect, useRef, useState } from "react";
import "./ExportTab.css";
import { CreateExportVectorAction, PluginAction } from "../../../plugin/types";
import {
  SymbolContext,
  SymbolContextProviderValue,
} from "../../context/SymbolProvider";
import { postMessageToPlugin } from "../../helpers/pluginHelpers";

export function ExportTab() {
  const { symbol, setSymbol, validationErrors, isValid } = useContext(
    SymbolContext
  ) as SymbolContextProviderValue;

  const [canExport, setCanExport] = useState(false);

  useEffect(() => {
    setCanExport(symbol?.symbolVectorId !== undefined && isValid);
  }, [symbol?.symbolVectorId, isValid]);

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

  // const revalidate = () => {
  //   if (symbol === undefined || symbol.id === undefined) return;
  //   postMessageToPlugin({
  //     type: "validate-node-as-symbol",
  //     payload: { nodeId: symbol.id },
  //   });
  // };

  // const selectNewSymbol = () => {
  //   if (!symbol) return;
  //   setSymbol();
  //   postMessageToPlugin({
  //     type: "validate-selection-as-symbol",
  //     payload: null,
  //   });
  // };

  if (symbol) {
    return (
      <div>
        <p>
          {symbol.name} ({symbol.id})
        </p>
        {validationErrors.map((e) => {
          return (
            <p>
              {e.category}: {e.error}
            </p>
          );
        })}
        {isValid && (
          <button className={"brand"} onClick={() => onCreate()}>
            Create Export Symbol
          </button>
        )}
        {canExport && (
          <button className={"brand"} onClick={() => onExportAsSvg()}>
            Export As SVG
          </button>
        )}

        {/* <button className={"brand"} onClick={() => revalidate()}>
          Re-evaluate
        </button>
        <button className={"brand"} onClick={() => selectNewSymbol()}>
          Select new Symbol
        </button> */}
      </div>
    );
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
