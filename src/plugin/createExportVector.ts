import { AnnotationSymbol } from "./types";
import { validateSymbol } from "./validation";

const t = ["POLYGON", "LINE", "ELLIPSE", "RECTANGLE"];
type ttt = LineNode | RectangleNode | EllipseNode | PolygonNode;

export function createExportVector(nodes: ReadonlyArray<SceneNode>) {
  const validationResult = validateSymbol(nodes);

  if (validationResult.validationError) {
    figma.notify(validationResult.validationError);
    return;
  } else if (!validationResult.annotationSymbol) {
    figma.notify("Unknown error occurred!");
    return;
  }

  const { mainFrame, symbolFrame, annotationsGroup } =
    validationResult.annotationSymbol;

  // Clone symbol group

  const symbolFrameExp = symbolFrame.clone();
  symbolFrameExp.name = "Symbol_EXP";

  mainFrame.appendChild(symbolFrameExp);

  const vNodes: VectorNode[] = [];

  for (let i = 0; i < symbolFrameExp.children.length; i++) {
    const child = symbolFrameExp.children[i];
    if (t.indexOf(child.type) == -1) continue;
    const d = child as ttt;
    const vNode = d.outlineStroke();
    if (vNode) vNodes.push(vNode);
  }

  // Delete existing nodes in cloned Symbol frame
  // For some weird reason we have to perform remove loop many times...
  while (symbolFrameExp.children.length > 0) {
    for (let i = 0; i < symbolFrameExp.children.length; i++) {
      console.log("Remove:", symbolFrameExp.children[i].name);
      symbolFrameExp.children[i].remove();
    }
  }

  // Add outlined nodes (vectors) to export frame
  for (let i = 0; i < vNodes.length; i++) {
    symbolFrameExp.appendChild(vNodes[i]);
  }

  // Union and flatten the outlined vectors
  figma.union(symbolFrameExp.children, symbolFrameExp);
  figma.flatten(symbolFrameExp.children, symbolFrameExp);

  console.log({ ...symbolFrameExp.children });

  // const exp = await mainFrame.exportAsync({
  //   format: "SVG",
  //   svgIdAttribute: true,
  //   svgOutlineText: true,
  //   svgSimplifyStroke: false,
  // });
}
