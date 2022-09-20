import { designGroupName } from "./constants";
import { AnnotationSymbol, SymbolValidationResult } from "./types";

export function validateSelectionAsSymbol(
  nodes: ReadonlyArray<SceneNode>
): void {
  const validationResult = validateSymbol(nodes);

  let error = undefined;

  if (validationResult.validationError) {
    error = validationResult.validationError;
  } else if (!validationResult.annotationSymbol) {
    error = "Unknown error occurred!";
  }

  const payload = error
    ? { symbolValidationError: error }
    : {
        symbol:
          validationResult.annotationSymbol?.mainFrame.name ?? "No name??",
      };

  figma.ui.postMessage(payload);
}

export function validateSymbol(
  nodes: ReadonlyArray<SceneNode>
): SymbolValidationResult {
  const selectionErrorMsg =
    "Select a single Frame that contains two Groups: 'Design' and 'Annotations'";

  if (!(nodes.length == 1 && nodes[0].type == "FRAME"))
    return { validationError: selectionErrorMsg };

  const frame = nodes[0];

  const symbolGroups = frame.children.filter(
    (c) =>
      c.name.toLowerCase() === designGroupName.toLowerCase() &&
      c.type === "GROUP"
  ) as GroupNode[];

  if (symbolGroups.length != 1) return { validationError: selectionErrorMsg };

  const annotationsGroups = frame.children.filter(
    (c) => c.name.toLowerCase() === "annotations" && c.type === "GROUP"
  ) as GroupNode[];

  if (annotationsGroups.length != 1)
    return { validationError: selectionErrorMsg };

  if (frame.width < 24 || frame.height < 24)
    return {
      validationError:
        "The Symbol frame width and height must greater than 24px",
    };

  if (frame.height % 24 !== 0 || frame.width % 24 !== 0)
    return {
      validationError:
        "The Symbol frame width and height must be a multiple of 24",
    };

  return {
    annotationSymbol: {
      mainFrame: frame,
      symbolGroup: symbolGroups[0],
      annotationsGroup: annotationsGroups[0],
    },
  };
}
