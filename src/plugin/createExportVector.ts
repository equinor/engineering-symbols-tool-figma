import { AnnotationSymbol, SymbolValidationResult } from "./types";
import { validateSymbol } from "./validation";

const t: SceneNode["type"][] = [
  "POLYGON",
  "LINE",
  "ELLIPSE",
  "RECTANGLE",
  "VECTOR",
];

type SupportedNodeType =
  | LineNode
  | RectangleNode
  | EllipseNode
  | PolygonNode
  | VectorNode;

type NodeId = string;

export function createExportVectorFromNodeIdOrNodes(
  nodes: NodeId | ReadonlyArray<SceneNode>
) {
  let validationResult: SymbolValidationResult;

  if (typeof nodes === "string") {
    const node = figma.currentPage.findOne((n) => n.id === nodes);
    validationResult = validateSymbol(node ? [node] : []);
  } else {
    validationResult = validateSymbol(nodes);
  }
  const annotationSymbol = handleValidation(validationResult);
  if (!annotationSymbol) return;
  const { mainFrame, designGroup } = annotationSymbol;
  createExportVector(mainFrame, designGroup);
  figma.notify("Symbol Export Layer Created", {
    timeout: 2500,
  });
}

function handleValidation(validationResult: SymbolValidationResult) {
  const onlyFillRuleError =
    validationResult.validationErrors.length === 1 &&
    validationResult.validationErrors[0].category === "Export Layer Fill Rule";

  if (validationResult.validationErrors.length > 0 && !onlyFillRuleError) {
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

  // Create export nodes
  const expNodes: SceneNode[] = [];
  const tmpVectorSuffix = "tmpExportVector";

  for (let i = 0; i < designGroup.children.length; i++) {
    const child = designGroup.children[i];
    if (t.indexOf(child.type) == -1) continue;
    const d = child as SupportedNodeType;

    let expNode: SceneNode | null = d.clone();

    // Remove strokes if node has fill
    if (Array.isArray(d.fills) && d.fills.length > 0) {
      expNode.strokes = [];
    }

    // Outline any strokes except vector nodes
    if (expNode.strokes.length > 0 && d.type !== "VECTOR") {
      expNode = expNode.outlineStroke();
    }

    if (!expNode) continue;

    expNode.name += expNode.name + `_${tmpVectorSuffix}`;
    expNodes.push(expNode);
  }

  // Add outlined nodes (vectors) to main frame
  for (let i = 0; i < expNodes.length; i++) {
    mainFrame.appendChild(expNodes[i]);
  }

  const tmpVectors = mainFrame.findChildren((c) => {
    const a = c.name.split("_");
    return a[a.length - 1] === tmpVectorSuffix;
  });

  // Union and flatten the outlined vectors
  const union = figma.union(tmpVectors, mainFrame, 0);
  const symbolVector = figma.flatten([union], mainFrame, 0);

  symbolVector.name = "Symbol";

  // NOTE: When adding the flatten vector to the main frame, x and y is the offset within
  // the design group!
  symbolVector.x += designGroup.x;
  symbolVector.y += designGroup.y;

  const fills = JSON.parse(JSON.stringify(symbolVector.fills));
  fills[0].color = { r: 0, g: 0, b: 0 };
  symbolVector.fills = fills;
}
