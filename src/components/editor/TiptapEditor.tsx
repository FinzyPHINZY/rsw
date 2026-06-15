"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import type { JSONContent } from "@tiptap/react";
import { tiptapExtensions } from "@/lib/tiptap-extensions";
import { Button } from "@/components/ui/Button";

export function TiptapEditor({
  value,
  onChange,
}: {
  value: JSONContent;
  onChange: (json: JSONContent) => void;
}) {
  const editor = useEditor({
    extensions: tiptapExtensions,
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getJSON()),
    editorProps: {
      attributes: { class: "prose max-w-none min-h-[300px] focus:outline-none" },
    },
  });

  if (!editor) return null;

  async function addImage() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) editor!.chain().focus().setImage({ src: data.url }).run();
    };
    input.click();
  }

  return (
    <div className="rounded-md border border-gray-300">
      <div className="flex flex-wrap gap-1 border-b border-gray-200 p-2">
        <Button type="button" variant="secondary" onClick={() => editor.chain().focus().toggleBold().run()}>B</Button>
        <Button type="button" variant="secondary" onClick={() => editor.chain().focus().toggleItalic().run()}>I</Button>
        <Button type="button" variant="secondary" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</Button>
        <Button type="button" variant="secondary" onClick={() => editor.chain().focus().toggleBulletList().run()}>• List</Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            const url = prompt("Link URL");
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }}
        >
          Link
        </Button>
        <Button type="button" variant="secondary" onClick={addImage}>Image</Button>
      </div>
      <div className="p-3">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
