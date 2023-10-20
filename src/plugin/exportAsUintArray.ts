export async function exportAsUintArray(node: FrameNode) {
  const exportNodes = ["symbol"];

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
    svgSimplifyStroke: false,
  });

  for (let i = 0; i < node.children.length; i++) {
    node.children[i].visible = originalVisibility[i];
  }

  return uInt8Array;
}
