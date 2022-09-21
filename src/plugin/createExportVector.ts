import { AnnotationSymbol, SymbolValidationResult } from "./types";
import { validateSymbol } from "./validation";

const t = ["POLYGON", "LINE", "ELLIPSE", "RECTANGLE", "VECTOR"];
type ttt = LineNode | RectangleNode | EllipseNode | PolygonNode | VectorNode;

export function createExportVectorFromNodeId(nodeId: string) {
  const node = figma.currentPage.findOne((n) => n.id === nodeId);
  const validationResult = validateSymbol(node ? [node] : []);
  const annotationSymbol = handleValidation(validationResult);
  if (!annotationSymbol) return;
  const { mainFrame, designGroup } = annotationSymbol;
  createExportVector(mainFrame, designGroup);
}

export function createExportVectorFromSelection(
  nodes: ReadonlyArray<SceneNode>
) {
  const validationResult = validateSymbol(nodes);
  const annotationSymbol = handleValidation(validationResult);
  if (!annotationSymbol) return;
  const { mainFrame, designGroup } = annotationSymbol;
  createExportVector(mainFrame, designGroup);
}

function handleValidation(validationResult: SymbolValidationResult) {
  if (validationResult.validationErrors.length > 0) {
    figma.notify(`${validationResult.validationErrors.length} error(s)`, {
      error: true,
    });
    return undefined;
  } else if (!validationResult.annotationSymbol) {
    figma.notify("Unknown error occurred!", { error: true });
    return undefined;
  }
  return validationResult.annotationSymbol;
}

function createExportVector(mainFrame: FrameNode, designGroup: GroupNode) {
  // Delete existing "Symbol" vectors
  const existingSymbolVectors = mainFrame.findChildren(
    (n) => n.type === "VECTOR" && n.name.toLowerCase() === "symbol"
  );

  for (let i = 0; i < existingSymbolVectors.length; i++) {
    existingSymbolVectors[i].remove();
  }

  // Outline strokes
  const vNodes: VectorNode[] = [];
  const tmpVectorSuffix = "tmpExportVector";

  for (let i = 0; i < designGroup.children.length; i++) {
    const child = designGroup.children[i];
    if (t.indexOf(child.type) == -1) continue;
    const d = child as ttt;
    const vNode = d.type === "VECTOR" ? d.clone() : d.outlineStroke();
    if (vNode) {
      vNode.name += `_${tmpVectorSuffix}`;
      vNodes.push(vNode);
    }
  }

  // Add outlined nodes (vectors) to main frame
  for (let i = 0; i < vNodes.length; i++) {
    mainFrame.appendChild(vNodes[i]);
  }

  const tmpVectors = mainFrame.findChildren((c) => {
    const a = c.name.split("_");
    return a[a.length - 1] === tmpVectorSuffix;
  });

  // Union and flatten the outlined vectors
  const union = figma.union(tmpVectors, mainFrame);
  const symbolVector = figma.flatten([union], mainFrame);

  symbolVector.name = "Symbol";
  symbolVector.x = designGroup.x;
  symbolVector.y = designGroup.y;

  const fills = JSON.parse(JSON.stringify(symbolVector.fills));
  fills[0].color = { r: 0, g: 0, b: 0 };
  symbolVector.fills = fills;
}
