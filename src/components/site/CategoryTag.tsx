import Link from "next/link";

export function CategoryTag({ name, slug }: { name: string; slug?: string }) {
  const className =
    "inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary";
  if (!slug) return <span className={className}>{name}</span>;
  return (
    <Link href={`/news?category=${slug}`} className={className}>
      {name}
    </Link>
  );
}
