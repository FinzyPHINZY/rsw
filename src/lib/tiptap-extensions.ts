import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";

// Single source of truth for which Tiptap nodes/marks the app supports.
// StarterKit (v3) bundles the Link mark; configure it here.
// The HTML renderer in tiptap-render.ts MUST support this same set:
// doc, paragraph, heading, bulletList, orderedList, listItem, hardBreak,
// text marks: bold, italic, link; plus the image node.
// (Type is inferred — useEditor accepts this array directly.)
export const tiptapExtensions = [
  StarterKit.configure({ link: { openOnClick: false } }),
  Image,
];
