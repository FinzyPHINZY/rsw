"use client";
import { useActionState } from "react";
import Link from "next/link";
import { registerAction, type RegisterState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

const initial: RegisterState = {};

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(registerAction, initial);

  return (
    <main className="flex min-h-[60vh] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-sm">
        <h1 className="mb-6 text-xl font-bold">Create your account</h1>
        <form action={formAction} className="space-y-4">
          <Input name="username" placeholder="Username" required minLength={3} />
          <Input name="email" type="email" placeholder="Email" required />
          <Input name="password" type="password" placeholder="Password (min 8 chars)" required minLength={8} />
          {state.error && <p className="text-sm text-danger">{state.error}</p>}
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Creating…" : "Register"}
          </Button>
        </form>
        <p className="mt-4 text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">Log in</Link>
        </p>
      </Card>
    </main>
  );
}
