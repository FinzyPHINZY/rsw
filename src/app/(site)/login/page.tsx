"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password");
      return;
    }
    router.push(params.get("from") ?? "/");
    router.refresh();
  }

  return (
    <Card className="w-full max-w-sm">
      <h1 className="mb-6 text-xl font-bold">Log in</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Logging in…" : "Log in"}
        </Button>
      </form>
      <p className="mt-4 text-sm text-gray-500">
        No account?{" "}
        <Link href="/register" className="text-primary hover:underline">Register</Link>
      </p>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-[60vh] items-center justify-center px-4 py-12">
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
