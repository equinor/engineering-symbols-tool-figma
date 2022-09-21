export function saveBlob(uint8array: Uint8Array, fileName: string) {
  const a = document.createElement("a");
  a.setAttribute("style", "display: none");
  document.body.appendChild(a);
  const url = window.URL.createObjectURL(new Blob([uint8array]));
  a.href = url;
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(url);
}
