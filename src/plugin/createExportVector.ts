import { AnnotationSymbol } from "./types";
import { validateSymbol } from "./validation";

const t = ["POLYGON", "LINE", "ELLIPSE", "RECTANGLE", "VECTOR"];
type ttt = LineNode | RectangleNode | EllipseNode | PolygonNode | VectorNode;

export function createExportVector(nodes: ReadonlyArray<SceneNode>) {
  const validationResult = validateSymbol(nodes);

  if (validationResult.validationError) {
    figma.notify(validationResult.validationError);
    return;
  } else if (!validationResult.annotationSymbol) {
    figma.notify("Unknown error occurred!");
    return;
  }

  const { mainFrame, symbolGroup, annotationsGroup } =
    validationResult.annotationSymbol;

  // TODO: Delete existing "Symbol" vectors!

  // Clone symbol group

  const vNodes: VectorNode[] = [];

  for (let i = 0; i < symbolGroup.children.length; i++) {
    const child = symbolGroup.children[i];
    if (t.indexOf(child.type) == -1) continue;
    const d = child as ttt;
    const vNode = d.type === "VECTOR" ? d.clone() : d.outlineStroke();
    if (vNode) {
      vNode.name += "_tmp";
      vNodes.push(vNode);
    }
  }

  // Add outlined nodes (vectors) to export frame
  for (let i = 0; i < vNodes.length; i++) {
    mainFrame.appendChild(vNodes[i]);
  }

  const tmpVectors = mainFrame.findChildren((c) => {
    const a = c.name.split("_");
    return a[a.length - 1] === "tmp";
  });

  // Union and flatten the outlined vectors
  const union = figma.union(tmpVectors, mainFrame);
  const symbolVector = figma.flatten([union], mainFrame);

  symbolVector.name = "Symbol";
  symbolVector.x = symbolGroup.x;
  symbolVector.y = symbolGroup.y;

  const fills = JSON.parse(JSON.stringify(symbolVector.fills));
  fills[0].color = { r: 0, g: 0, b: 0 };
  symbolVector.fills = fills;
}
