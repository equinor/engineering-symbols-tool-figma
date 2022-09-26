import React, {
  createContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AnnotationSymbol,
  AnnotationSymbolUi,
  PluginAction,
  UiMessage,
  ValidateSelectionAsSymbolAction,
  ValidationError,
} from "../../plugin/types";
import { postMessageToPlugin } from "../helpers/pluginHelpers";
import { saveBlob } from "../helpers/saveBlob";

type SymbolContextProviderProps = { children: React.ReactNode };

export type SymbolContextProviderValue = {
  symbol?: AnnotationSymbolUi;
  setSymbol: (symbol?: AnnotationSymbolUi) => void;
  validationErrors: ValidationError[];
  isValid: boolean;
  createExportLayer: () => void;
  canCreateExportLayer: boolean;
};

export const SymbolContext = createContext<SymbolContextProviderValue | null>(
  null
);

export function SymbolContextProvider({
  children,
}: SymbolContextProviderProps) {
  const [symbol, _setSymbol] = useState<AnnotationSymbolUi>();
  const [validationErrors, _setValidationErrors] = useState<ValidationError[]>(
    []
  );

  const symbolRef = useRef(symbol);
  const validationErrorsRef = useRef(validationErrors);

  const setSymbol = (symbol?: AnnotationSymbolUi) => {
    symbolRef.current = symbol;
    _setSymbol(symbolRef.current);
  };

  const setValidationErrors = (errors: ValidationError[]) => {
    validationErrorsRef.current = errors;
    _setValidationErrors([...validationErrorsRef.current]);
  };

  const [isValid, setIsValid] = useState<boolean>(false);

  useEffect(() => {
    let errors = 0;
    if (validationErrors.length > 0) errors++;
    setIsValid(errors === 0);
  }, [validationErrors]);

  const requestSelectionValidation = () => {
    const action: PluginAction = {
      type: "validate-selection-as-symbol",
      payload: null,
    };
    postMessageToPlugin(action);
  };

  function handlePluginMessage(
    event: MessageEvent<{ pluginMessage: UiMessage }>
  ) {
    //console.log("From plugin:", { ...event.data });
    const msg = event.data.pluginMessage;
    if (!msg) return;

    switch (msg.type) {
      case "symbol-validation-result":
        setSymbol(msg.payload.symbol);
        setValidationErrors(msg.payload.validationErrors);
        break;
      case "selection-changed":
        requestSelectionValidation();
        break;
      case "export-as-svg":
        saveBlob(msg.payload.uInt8Array, msg.payload.fileName);
      default:
        break;
    }
  }

  const createExportLayer = () => {
    if (symbol === undefined || symbol.id === undefined) return;
    postMessageToPlugin({
      type: "create-export-vector",
      payload: { nodeId: symbol.id },
    });
  };

  const canCreateExportLayer =
    (validationErrors.length === 1 &&
      validationErrors[0].category === "Export Layer Fill Rule") ||
    isValid;

  useEffect(() => {
    if (!symbol?.id) return;
    const validateInterval = setInterval(() => {
      postMessageToPlugin({
        type: "validate-node-as-symbol",
        payload: { nodeId: symbol.id },
      });
    }, 200);

    return () => {
      clearInterval(validateInterval);
    };
  }, [symbol?.id]);

  useEffect(() => {
    window.addEventListener("message", handlePluginMessage);
    requestSelectionValidation();
    return () => {
      window.removeEventListener("message", handlePluginMessage);
    };
  }, []);

  return (
    <SymbolContext.Provider
      value={{
        symbol,
        setSymbol,
        validationErrors,
        isValid,
        createExportLayer,
        canCreateExportLayer,
      }}>
      {children}
    </SymbolContext.Provider>
  );
}
