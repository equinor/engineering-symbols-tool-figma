import { createExportVector } from "./createExportVector";
import { PluginAction } from "./types";
import { validateSelectionAsSymbol } from "./validation";

type ShowUiOptionsExtended = ShowUIOptions & { themeColors: boolean };

figma.showUI(__html__, {
  title: "Engineering Symbols Tool",
  height: 300,
  themeColors: true,
} as ShowUiOptionsExtended);

figma.ui.postMessage({
  pluginMessage: { newSelection: figma.currentPage.selection },
});

figma.ui.onmessage = (msg: PluginAction) => {
  switch (msg.type) {
    case "create-symbol":
      break;

    case "create-export-vector":
      createExportVector(figma.currentPage.selection);
      break;
    case "validate-selection-as-symbol":
      validateSelectionAsSymbol(figma.currentPage.selection);
      break;
    default:
      break;
  }
};

figma.on("selectionchange", () => {
  console.log(figma.currentPage.selection);
  figma.ui.postMessage({
    pluginMessage: { newSelection: figma.currentPage.selection },
  });
});
