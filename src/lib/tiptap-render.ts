type Mark = { type: string; attrs?: Record<string, unknown> };
type Node = {
  type?: string;
  text?: string;
  content?: Node[];
  attrs?: Record<string, unknown>;
  marks?: Mark[];
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function applyMarks(text: string, marks: Mark[] = []): string {
  return marks.reduce((acc, mark) => {
    switch (mark.type) {
      case "bold":
        return `<strong>${acc}</strong>`;
      case "italic":
        return `<em>${acc}</em>`;
      case "link": {
        const href = escapeHtml(String(mark.attrs?.href ?? "#"));
        return `<a href="${href}">${acc}</a>`;
      }
      default:
        return acc;
    }
  }, text);
}

function renderChildren(node: Node): string {
  return (node.content ?? []).map(renderNode).join("");
}

function renderNode(node: Node): string {
  switch (node.type) {
    case "text":
      return applyMarks(escapeHtml(node.text ?? ""), node.marks);
    case "paragraph":
      return `<p>${renderChildren(node)}</p>`;
    case "heading": {
      const level = Number(node.attrs?.level ?? 2);
      return `<h${level}>${renderChildren(node)}</h${level}>`;
    }
    case "bulletList":
      return `<ul>${renderChildren(node)}</ul>`;
    case "orderedList":
      return `<ol>${renderChildren(node)}</ol>`;
    case "listItem":
      return `<li>${renderChildren(node)}</li>`;
    case "hardBreak":
      return "<br>";
    case "image": {
      const src = escapeHtml(String(node.attrs?.src ?? ""));
      const alt = escapeHtml(String(node.attrs?.alt ?? ""));
      return `<img src="${src}" alt="${alt}">`;
    }
    default:
      return renderChildren(node);
  }
}

export function renderTiptap(doc: unknown): string {
  return renderChildren(doc as Node);
}
