import { SymbolVectorData } from "./types";

export function updateSymbolVectorNetwork(vectorData: SymbolVectorData) {
  const node = figma.getNodeById(vectorData.id);
  console.log("setting v net");
  if (node !== null && node.type === "VECTOR") {
    console.log("setting v net");
    node.vectorNetwork = vectorData.vectorNetwork;
  }
}
