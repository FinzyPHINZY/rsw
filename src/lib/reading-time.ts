type TiptapNode = {
  type?: string;
  text?: string;
  content?: TiptapNode[];
};

function collectText(node: TiptapNode | null | undefined): string {
  if (!node) return "";
  if (node.type === "text") return node.text ?? "";
  return (node.content ?? []).map(collectText).join(" ");
}

export function readingTimeFromTiptap(doc: unknown): number {
  const text = collectText(doc as TiptapNode).trim();
  const words = text ? text.split(/\s+/).length : 0;
  return Math.max(1, Math.ceil(words / 200));
}
