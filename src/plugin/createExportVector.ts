import {
  NodeId,
  SupportedNodeType,
  SupportedNodeTypes,
  SymbolValidationResult,
} from "./types";
import { validateSymbol } from "./validation";

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
  } else if (!validationResult.symbol) {
    figma.notify("Unknown error occurred!", { error: true });
    return undefined;
  }
  return validationResult.symbol;
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
  const tmpVectorSuffix = "tmpExportVector";

  for (let i = 0; i < designGroup.children.length; i++) {
    const child = designGroup.children[i];
    //console.log(child.type);
    if (SupportedNodeTypes.indexOf(child.type) == -1) continue;
    const node = child as SupportedNodeType;

    let expNode: SceneNode | null = null;

    if (node.strokes.length > 0 && node.type !== "VECTOR") {
      // Outline any strokes except vector nodes
      expNode = node.outlineStroke();
    } else {
      expNode = node.clone();
      // Remove strokes if node has fill
      if (Array.isArray(node.fills) && node.fills.length > 0) {
        expNode.strokes = [];
      }
    }

    if (!expNode) continue;

    expNode.name += expNode.name + `_${tmpVectorSuffix}`;
    mainFrame.appendChild(expNode);
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
  fills[0].color = { r: 0.137, g: 0.122, b: 0.125 };
  symbolVector.fills = fills;
}
