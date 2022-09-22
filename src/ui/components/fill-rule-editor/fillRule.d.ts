import { SymbolVectorData } from "../../../plugin/types";

export function setCanvas(canvas: HTMLCanvasElement): void;
export function setContainer(container: HTMLDivElement): void;
export function updateNode(nodeData: SymbolVectorData): void;
//export let onNodeMutated: (nodeData: SymbolVectorData) => void;
export function setOnNodeMutatedCallback(
  callback: (nodeData: SymbolVectorData) => void
): void;
