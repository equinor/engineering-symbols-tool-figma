import { UiMessage } from "./types";

export async function exportAsSvg(nodeId: string) {
  const node = figma.currentPage.findOne((n) => n.id === nodeId) as FrameNode;

  if (!node) return;

  const exportNodes = ["symbol", "annotations"];

  const originalVisibility: boolean[] = [];

  for (let i = 0; i < node.children.length; i++) {
    originalVisibility.push(node.children[i].visible);
  }

  // Hide non-export nodes
  for (let i = 0; i < node.children.length; i++) {
    const n = node.children[i];
    n.visible = exportNodes.indexOf(n.name.toLowerCase()) !== -1;
  }

  const uInt8Array = await node.exportAsync({
    format: "SVG",
    svgIdAttribute: true,
    contentsOnly: true,
  });

  for (let i = 0; i < node.children.length; i++) {
    node.children[i].visible = originalVisibility[i];
  }

  const fileName =
    node.name.replace(/[^a-z0-9\.]/gi, "_").replace(/_{2,}/g, "_") + ".svg";

  figma.ui.postMessage({
    type: "export-as-svg",
    payload: { uInt8Array: uInt8Array, fileName },
  } as UiMessage);
}
