import { createExportVectorFromNodeIdOrNodes } from "./createExportVector";
import { createPreviewBlob } from "./createPreviewBlob";
import { exportAsSvg } from "./exportAsSvg";
import { PluginAction, SelectionChangedMessage } from "./types";
import { updateSymbolVectorNetwork } from "./updateSymbolVector";
import { validateNodeAsSymbol, validateSelectionAsSymbol } from "./validation";

type ShowUiOptionsExtended = ShowUIOptions & { themeColors: boolean };

function getSelectionChangedUiMsg(): SelectionChangedMessage {
  return {
    type: "selection-changed",
    payload: { selection: figma.currentPage.selection },
  };
}

figma.showUI(__html__, {
  title: "Engineering Symbols Tool",
  height: 450,
  width: 450,
  themeColors: true,
} as ShowUiOptionsExtended);

figma.ui.onmessage = (msg: PluginAction) => {
  switch (msg.type) {
    case "create-export-vector":
      createExportVectorFromNodeIdOrNodes(msg.payload.nodeId);
      createPreviewBlob(msg.payload.nodeId);
      break;
    case "validate-selection-as-symbol":
      validateSelectionAsSymbol(figma.currentPage.selection);
      break;
    case "validate-node-as-symbol":
      validateNodeAsSymbol(msg.payload.nodeId);
      break;
    case "create-export-blob":
      exportAsSvg(msg.payload.nodeId);
      break;
    case "export-vector-network-updated":
      updateSymbolVectorNetwork(msg.payload.symbolVectorData);
      createPreviewBlob(msg.payload.nodeId);
      break;
    case "request-preview":
      createPreviewBlob(msg.payload.nodeId);
      break;
    default:
      break;
  }
};

figma.on("selectionchange", () => {
  figma.ui.postMessage(getSelectionChangedUiMsg());
});

figma.ui.postMessage(getSelectionChangedUiMsg());
