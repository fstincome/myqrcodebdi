export function isWebUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (url.protocol === "http:" || url.protocol === "https:") && Boolean(url.hostname);
  } catch {
    return false;
  }
}

export function createQrContent(url: string, description: string): string {
  const link = url.trim();
  const information = description.trim();
  return information ? `${link}\n\n${information}` : link;
}

export function readQrContent(value: string): { url: string | null; description: string; text: string } {
  const text = value.trim();
  const [firstLine, ...remaining] = text.split(/\r?\n/);
  const url = firstLine.trim();
  if (!isWebUrl(url)) return { url: null, description: "", text };
  return { url, description: remaining.join("\n").trim(), text };
}