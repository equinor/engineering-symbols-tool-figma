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

type SymbolContextProviderProps = { children: React.ReactNode };

export type SymbolContextProviderValue = {
  symbol?: AnnotationSymbolUi;
  setSymbol: (symbol?: AnnotationSymbolUi) => void;
  validationErrors: ValidationError[];
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
        //if (symbolRef.current?.id !== msg.payload.symbol?.id)
        setSymbol(msg.payload.symbol);
        setValidationErrors(msg.payload.validationErrors);
        break;
      case "selection-changed":
        requestSelectionValidation();
      default:
        break;
    }
  }

  useEffect(() => {
    if (!symbol?.id) return;
    const validateInterval = setInterval(() => {
      postMessageToPlugin({
        type: "validate-node-as-symbol",
        payload: { nodeId: symbol.id },
      });
    }, 3000);

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
    <SymbolContext.Provider value={{ symbol, setSymbol, validationErrors }}>
      {children}
    </SymbolContext.Provider>
  );
}
