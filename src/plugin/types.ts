export type PluginAction = {
  type:
    | "create-symbol"
    | "create-export-vector"
    | "validate-selection-as-symbol";
};

export type AnnotationSymbol = {
  mainFrame: FrameNode;
  symbolFrame: FrameNode;
  annotationsGroup: GroupNode;
};

export type SymbolValidationResult = {
  annotationSymbol?: AnnotationSymbol;
  validationError?: string;
};

export interface ConnectorSymbol {
  id: string;
  width: number;
  height: number;
  connectors: SymbolConnector[];
}

export interface SymbolConnector {
  id: string;
  relativePosition: { x: number; y: number };
  direction: number;
}

// export type UiMessage<TMsgType> = {
//   type: TMsgType;
// }

// export type UiMessageType = "";

// export interface UiMessage {
//   id: string;
//   relativePosition: { x: number; y: number };
//   direction: number;
// }
