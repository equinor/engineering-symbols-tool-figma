export type PluginActionType =
  | "create-export-vector"
  | "create-export-blob"
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

export type CreateExportBlobAction = PluginActionBase<
  "create-export-blob",
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
  | CreateExportVectorAction
  | CreateExportBlobAction;

export type UiMessageType =
  | "selection-changed"
  | "symbol-validation-result"
  | "export-as-svg";

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

export type ExportAsSvgMessage = UiMessageBase<
  "export-as-svg",
  { uInt8Array: Uint8Array; fileName: string }
>;

export type UiMessage =
  | SelectionChangedMessage
  | SymbolValidationResultMessage
  | ExportAsSvgMessage;

export type AnnotationSymbolUi = {
  id: string;
  name: string;
  width: number;
  height: number;
  designGroupId: string;
  annotationGroupId: string;
  symbolVectorId?: string;
};

export type AnnotationSymbol = {
  id: string;
  mainFrame: FrameNode;
  designGroup: GroupNode;
  annotationsGroup: GroupNode;
  symbolVectorId?: string;
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
