import { exportAsUintArray } from "./exportAsUintArray";
import { UiMessage } from "./types";

export async function createPreviewBlob(nodeId: string) {
  const node = figma.currentPage.findOne((n) => n.id === nodeId) as FrameNode;

  if (!node) return;

  const uint8Array = await exportAsUintArray(node);

  let svgString = uint8Array.reduce(
    (acc, byte) => acc + String.fromCharCode(byte),
    ""
  );

  figma.ui.postMessage({
    type: "symbol-preview",
    payload: { svgString },
  } as UiMessage);
}
