export type PluginActionType =
  | "create-export-vector"
  | "create-export-blob"
  | "export-vector-network-updated"
  | "validate-selection-as-symbol"
  | "validate-node-as-symbol"
  | "request-preview";

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

export type ExportVectorNetworkUpdatedAction = PluginActionBase<
  "export-vector-network-updated",
  { nodeId: string; symbolVectorData: SymbolVectorData }
>;

export type ValidateSelectionAsSymbolAction = PluginActionBase<
  "validate-selection-as-symbol",
  null
>;

export type ValidateNodeAsSymbolAction = PluginActionBase<
  "validate-node-as-symbol",
  { nodeId: string }
>;

export type RequestPreviewAction = PluginActionBase<
  "request-preview",
  { nodeId: string }
>;

export type PluginAction =
  | ValidateNodeAsSymbolAction
  | ValidateSelectionAsSymbolAction
  | CreateExportVectorAction
  | CreateExportBlobAction
  | ExportVectorNetworkUpdatedAction
  | RequestPreviewAction;

export type UiMessageType =
  | "selection-changed"
  | "symbol-validation-result"
  | "export-as-svg"
  | "symbol-preview";

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
  { validationErrors: ValidationError[]; symbol?: EsSymbolUi }
>;

export type ExportAsSvgMessage = UiMessageBase<
  "export-as-svg",
  { uInt8Array: Uint8Array; fileName: string }
>;

export type SymbolPreviewMessage = UiMessageBase<
  "symbol-preview",
  { svgString: string }
>;

export type UiMessage =
  | SelectionChangedMessage
  | SymbolValidationResultMessage
  | ExportAsSvgMessage
  | SymbolPreviewMessage;

export type SymbolVectorData = {
  id: string;
  vectorNetwork: VectorNetwork;
};

export type EsSymbolUi = {
  id: string;
  name: string;
  width: number;
  height: number;
  designGroupId: string;
  symbolVectorData?: SymbolVectorData;
};

export type EsSymbol = {
  id: string;
  mainFrame: FrameNode;
  designGroup: GroupNode;
  symbolVectorData?: SymbolVectorData;
};

export type ValidationErrorCategory =
  | "Export Layer Fill Rule"
  | "Symbol Frame Dimensions"
  | "Invalid Selection"
  | "Design Group";

export type ValidationError = {
  category: ValidationErrorCategory;
  error: string;
};

export type SymbolValidationResult = {
  symbol?: EsSymbol;
  validationErrors: ValidationError[];
};

export const SupportedNodeTypes: readonly SceneNode["type"][] = [
  "LINE",
  "RECTANGLE",
  "ELLIPSE",
  "POLYGON",
  "VECTOR",
] as const;

export type SupportedNodeType =
  | LineNode
  | RectangleNode
  | EllipseNode
  | PolygonNode
  | VectorNode;

export type NodeId = string;
