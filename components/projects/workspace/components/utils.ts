export function getExt(name: string): string {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i).toLowerCase() : "";
}

export async function simulateUpload(
  file: File,
  onProgress: (p: number) => void,
): Promise<string> {
  // TODO: Replace with real API call
  console.log("[WorkspaceUpload]", { name: file.name, size: file.size });
  for (let p = 10; p <= 90; p += 20) {
    await new Promise((r) => setTimeout(r, 180));
    onProgress(p);
  }
  await new Promise((r) => setTimeout(r, 400));
  return `https://cdn.placeholder.example/drawings/${encodeURIComponent(file.name)}`;
}
