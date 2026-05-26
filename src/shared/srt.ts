const TIME_CODE_PATTERN =
  /^\d{2}:\d{2}:\d{2}[,.]\d{3}\s+-->\s+\d{2}:\d{2}:\d{2}[,.]\d{3}/;

export function extractSrtText(srtContent: string): string {
  const normalized = srtContent
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim();

  if (!normalized) {
    return "";
  }

  const blocks = normalized.split(/\n{2,}/);

  return blocks
    .map((block) => {
      const lines = block
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .filter((line) => !/^\d+$/.test(line))
        .filter((line) => !TIME_CODE_PATTERN.test(line))
        .map(stripSrtFormatting);

      return lines.join("\n").trim();
    })
    .filter(Boolean)
    .join("\n");
}

export function combineSrtFilesToText(files: Array<{ name: string; content: string }>): string {
  return files
    .map((file) => extractSrtText(file.content))
    .filter(Boolean)
    .join("\n\n");
}

function stripSrtFormatting(line: string): string {
  return line
    .replace(/<\/?(?:i|b|u|font|c|v)(?:\.[^>\s]+)?(?:\s+[^>]*)?>/gi, "")
    .replace(/\{\\[^}]+}/g, "")
    .trim();
}
