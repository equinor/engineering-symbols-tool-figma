import { EsSymbolUi } from "../../plugin/types";

export function cleanPreview(
  svgString: string,
  symbol: EsSymbolUi,
  maxPreviewSize: number
): { svgString: string; f: number } {
  // Parse the SVG string into a Document object
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, "image/svg+xml");

  const svg = doc.querySelector("svg");

  svg?.setAttribute("fill", "black");
  svg?.setAttribute("stroke", "none");

  let w = symbol.width;
  let h = symbol.height;

  let f = maxPreviewSize / Math.max(w, h);

  w = w * f;
  h = h * f;

  svg?.setAttribute("width", w.toString());
  svg?.setAttribute("height", h.toString());

  // Get all path elements
  const paths = doc.querySelectorAll("path");

  // Loop through each path element and remove the specified attributes
  paths.forEach((path) => {
    path.removeAttribute("fill-rule");
    path.removeAttribute("clip-rule");
    path.removeAttribute("fill");
    path.removeAttribute("stroke");
  });

  // Serialize the Document object back to a string
  const serializer = new XMLSerializer();
  const updatedSvgString = serializer.serializeToString(doc);

  return { svgString: updatedSvgString, f };
}
