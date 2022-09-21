import { createExportVectorFromNodeId } from "./createExportVector";
import { exportAsSvg } from "./exportAsSvg";
import { PluginAction, SelectionChangedMessage } from "./types";
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

figma.ui.postMessage(getSelectionChangedUiMsg());

figma.ui.onmessage = (msg: PluginAction) => {
  //console.log("From UI:", msg);
  switch (msg.type) {
    case "create-export-vector":
      createExportVectorFromNodeId(msg.payload.nodeId);
      break;
    case "validate-selection-as-symbol":
      validateSelectionAsSymbol(figma.currentPage.selection);
      break;
    case "validate-node-as-symbol":
      validateNodeAsSymbol(msg.payload.nodeId);
      break;
    case "create-export-blob":
      exportAsSvg(msg.payload.nodeId);
    default:
      break;
  }
};

figma.on("selectionchange", () => {
  //console.log(figma.currentPage.selection);
  figma.ui.postMessage(getSelectionChangedUiMsg());
});
