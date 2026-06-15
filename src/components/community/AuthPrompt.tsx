import Link from "next/link";

export function AuthPrompt({ action = "comment" }: { action?: string }) {
  return (
    <p className="rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
      <Link href="/login" className="font-medium text-primary hover:underline">Sign in</Link>{" "}
      or{" "}
      <Link href="/register" className="font-medium text-primary hover:underline">register</Link>{" "}
      to {action}.
    </p>
  );
}
