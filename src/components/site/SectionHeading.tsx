import Link from "next/link";

export function SectionHeading({
  title,
  href,
  linkLabel = "See all",
}: {
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-4 flex items-baseline justify-between border-b border-gray-200 pb-2">
      <h2 className="text-lg font-bold tracking-tight text-secondary">{title}</h2>
      {href && (
        <Link href={href} className="text-sm font-medium text-primary hover:underline">
          {linkLabel}
        </Link>
      )}
    </div>
  );
}
