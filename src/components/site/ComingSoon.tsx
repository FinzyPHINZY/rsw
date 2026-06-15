export function ComingSoon({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center">
      <p className="text-sm font-semibold text-secondary">{title}</p>
      <p className="mt-1 text-xs text-gray-500">{subtitle ?? "Coming soon"}</p>
    </div>
  );
}
