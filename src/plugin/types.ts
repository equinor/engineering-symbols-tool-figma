export type PluginActionType =
  | "create-export-vector"
  | "validate-selection-as-symbol"
  | "validate-node-as-symbol";

export type PluginActionBase<TActionType extends PluginActionType, TPayload> = {
  type: TActionType;
  payload: TPayload;
};

export type CreateExportVectorAction = PluginActionBase<
  "create-export-vector",
  { nodeId: string }
>;

export type ValidateSelectionAsSymbolAction = PluginActionBase<
  "validate-selection-as-symbol",
  null
>;

export type ValidateNodeAsSymbolAction = PluginActionBase<
  "validate-node-as-symbol",
  { nodeId: string }
>;

export type PluginAction =
  | ValidateNodeAsSymbolAction
  | ValidateSelectionAsSymbolAction
  | CreateExportVectorAction;

export type UiMessageType = "selection-changed" | "symbol-validation-result";

export type UiMessageBase<TMessageType extends UiMessageType, TPayload> = {
  type: TMessageType;
  payload: TPayload;
};

export type SelectionChangedMessage = UiMessageBase<
  "selection-changed",
  { selection: ReadonlyArray<SceneNode> }
>;

export type SymbolValidationResultMessage = UiMessageBase<
  "symbol-validation-result",
  { validationErrors: ValidationError[]; symbol?: AnnotationSymbolUi }
>;

export type UiMessage = SelectionChangedMessage | SymbolValidationResultMessage;

export type AnnotationSymbolUi = {
  id: string;
  name: string;
  width: number;
  height: number;
  designGroupId: string;
  annotationGroupId: string;
};

export type AnnotationSymbol = {
  id: string;
  mainFrame: FrameNode;
  designGroup: GroupNode;
  annotationsGroup: GroupNode;
};

export type ValidationError = { category: string; error: string };

export type SymbolValidationResult = {
  annotationSymbol?: AnnotationSymbol;
  validationErrors: ValidationError[];
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
