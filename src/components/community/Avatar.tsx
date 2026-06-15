export function Avatar({ username, size = 32 }: { username: string; size?: number }) {
  const initials = username.slice(0, 2).toUpperCase();
  return (
    <span
      className="inline-flex items-center justify-center rounded-full bg-primary/15 font-semibold text-primary"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      aria-hidden
    >
      {initials}
    </span>
  );
}
