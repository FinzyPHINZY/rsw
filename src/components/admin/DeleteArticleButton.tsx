"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

export function DeleteArticleButton({ id }: { id: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function confirmDelete() {
    await fetch(`/api/articles/${id}`, { method: "DELETE" });
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <button className="text-danger" onClick={() => setOpen(true)}>
        Delete
      </button>
      <Modal open={open} onClose={() => setOpen(false)}>
        <h2 className="mb-4 text-lg font-semibold">Delete this article?</h2>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </>
  );
}
