import { designGroupName } from "./constants";
import {
  EsSymbol,
  EsSymbolUi,
  SupportedNodeTypes,
  SymbolValidationResult,
  UiMessage,
  ValidationError,
} from "./types";

const BASE_SIZE: Readonly<number> = 1;

function AnnotationSymbolToUi(symbol: EsSymbol): EsSymbolUi {
  return {
    id: symbol.id,
    name: symbol.mainFrame.name,
    width: symbol.mainFrame.width,
    height: symbol.mainFrame.height,
    designGroupId: symbol.designGroup.id,
    symbolVectorData: symbol.symbolVectorData,
  };
}

function getValidationUiMessage(result: SymbolValidationResult): UiMessage {
  return {
    type: "symbol-validation-result",
    payload: {
      symbol: result.symbol ? AnnotationSymbolToUi(result.symbol) : undefined,
      validationErrors: result.validationErrors,
    },
  };
}

export function validateSelectionAsSymbol(
  nodes: ReadonlyArray<SceneNode>
): void {
  const validationResult = validateSymbol(nodes);
  const msg = getValidationUiMessage(validationResult);
  figma.ui.postMessage(msg);
}

export function validateNodeAsSymbol(nodeId: string): void {
  const node = figma.currentPage.findOne((n) => n.id === nodeId);
  const validationResult = validateSymbol(node ? [node] : []);
  const msg = getValidationUiMessage(validationResult);
  figma.ui.postMessage(msg);
}

function findFirstParentFrame(
  parent: (BaseNode & ChildrenMixin) | null
): string | undefined {
  if (!parent || parent.type === "PAGE") return undefined;
  if (parent.type === "FRAME") return parent.id;
  return findFirstParentFrame(parent.parent);
}

export function validateSymbol(
  nodes: ReadonlyArray<SceneNode>
): SymbolValidationResult {
  const selectionErrorMsg: ValidationError = {
    category: "Invalid Selection",
    error: "Select a single Frame that contains a Group named 'Design'",
    //"Select a single Frame that contains two Groups: 'Design' and 'Annotations'",
  };

  let frame: FrameNode;

  if (nodes.length == 1 && nodes[0].type == "FRAME") {
    frame = nodes[0];
  } else {
    // Search up in the tree
    if (nodes.length > 0) {
      const ancestorFrameId = findFirstParentFrame(nodes[0].parent);
      frame = figma.currentPage.findOne(
        (n) => n.id === ancestorFrameId
      ) as FrameNode;
      if (!frame) return { validationErrors: [selectionErrorMsg] };
    } else {
      return { validationErrors: [selectionErrorMsg] };
    }
  }

  const designGroups = frame.children.filter(
    (c) =>
      c.name.toLowerCase() === designGroupName.toLowerCase() &&
      c.type === "GROUP"
  ) as GroupNode[];

  if (designGroups.length != 1)
    return { validationErrors: [selectionErrorMsg] };

  const errors: ValidationError[] = [];

  const symbol: EsSymbol = {
    id: frame.id,
    mainFrame: frame,
    designGroup: designGroups[0],
  };

  // Check if design group has illegal nodes
  const illegalDesignNodes = designGroups[0].children.filter(
    (c) => SupportedNodeTypes.indexOf(c.type) === -1
  );

  if (illegalDesignNodes.length > 0) {
    const str = illegalDesignNodes.map((n) => n.type).join(", ");
    errors.push({
      category: "Design Group",
      error: "The 'Design Group' contains illegal element(s): " + str,
    });
  }

  const symbolVectors = frame.children.filter(
    (c) => c.name.toLowerCase() === "symbol" && c.type === "VECTOR"
  ) as VectorNode[];

  if (symbolVectors.length === 1) {
    symbol.symbolVectorData = {
      id: symbolVectors[0].id,
      vectorNetwork: JSON.parse(JSON.stringify(symbolVectors[0].vectorNetwork)),
    };

    const vnRegions = symbol.symbolVectorData.vectorNetwork.regions;

    if (vnRegions) {
      for (let j = 0; j < vnRegions.length; j++) {
        const r = vnRegions[j];
        if (r.windingRule === "NONZERO") continue;
        errors.push({
          category: "Export Layer Fill Rule",
          error:
            "The Symbol export layer contains 'even-odd' regions, but only 'non-zero' is accepted. Use the Fill Rule editor to set all regions to 'non-zero'.",
        });
        break;
      }
    }
  }

  if (symbolVectors.length > 1)
    errors.push({
      category: "Symbol Frame Dimensions",
      error:
        "The Symbol frame contains more than one Symbol Export Layer named 'Symbol'",
    });

  if (frame.width < BASE_SIZE || frame.height < BASE_SIZE)
    errors.push({
      category: "Symbol Frame Dimensions",
      error: `The Symbol frame width and height must be equal or greater than ${BASE_SIZE}px`,
    });

  if (frame.height % BASE_SIZE !== 0 || frame.width % BASE_SIZE !== 0)
    errors.push({
      category: "Symbol Frame Dimensions",
      error: `The Symbol frame width and height must be a multiple of ${BASE_SIZE}`,
    });

  return {
    symbol,
    validationErrors: errors,
  };
}
