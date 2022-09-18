import React, { useEffect, useRef, useState } from "react";
import "./ExportTab.css";
import { AnnotationSymbol, PluginAction } from "../../plugin/types";

export function ExportTab() {
  const [symbol, setSymbol] = useState<string>();
  const [validationError, setValidationError] = useState<string>();

  const requestSelectionValidation = () => {
    parent.postMessage(
      {
        pluginMessage: { type: "validate-selection-as-symbol" },
      },
      "*"
    );
  };

  const figmaSelectionHandler = (event: MessageEvent<any>) => {
    const msg = event.data.pluginMessage;
    if (!msg) return;
    console.log({ msg });
    if (msg.symbolValidationError) {
      setSymbol(undefined);
      setValidationError(msg.symbolValidationError);
    } else if (msg.symbol) {
      setSymbol(msg.symbol);
      setValidationError(undefined);
    } else if (msg.pluginMessage.newSelection) {
      requestSelectionValidation();
    }
  };

  useEffect(() => {
    window.addEventListener("message", figmaSelectionHandler);
    requestSelectionValidation();
    return () => {
      window.removeEventListener("message", figmaSelectionHandler);
    };
  }, []);

  const onCreate = () => {
    const action: PluginAction = { type: "create-export-vector" };
    parent.postMessage(
      {
        pluginMessage: action,
      },
      "*"
    );
  };

  if (symbol && !validationError) {
    return (
      <div>
        <p>Success</p>
        <button className={"brand"} onClick={() => onCreate()}>
          Create Export Symbol
        </button>
      </div>
    );
  }

  return (
    <div>
      <p>{validationError}</p>
    </div>
  );
}
