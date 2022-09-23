import { SymbolVectorData } from "./types";

export function updateSymbolVectorNetwork(vectorData: SymbolVectorData) {
  const node = figma.getNodeById(vectorData.id);
  if (node !== null && node.type === "VECTOR") {
    node.vectorNetwork = vectorData.vectorNetwork;
  }
}
