import { exportAsUintArray } from "./exportAsUintArray";
import { UiMessage } from "./types";

export async function exportAsSvg(nodeId: string) {
  const node = figma.currentPage.findOne((n) => n.id === nodeId) as FrameNode;

  if (!node) return;

  const uInt8Array = await exportAsUintArray(node);

  const fileName =
    node.name.replace(/[^a-z0-9\.]/gi, "_").replace(/_{2,}/g, "_") + ".svg";

  figma.ui.postMessage({
    type: "export-as-svg",
    payload: { uInt8Array: uInt8Array, fileName },
  } as UiMessage);
}
