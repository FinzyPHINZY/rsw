import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";

export class RegistrationError extends Error {}

const schema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(30),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function registerUser(input: {
  username: string;
  email: string;
  password: string;
}): Promise<{ id: string }> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    throw new RegistrationError(parsed.error.issues[0]?.message ?? "Invalid input");
  }
  const { username, email, password } = parsed.data;

  if (await db.user.findUnique({ where: { email } })) {
    throw new RegistrationError("Email already in use");
  }
  if (await db.user.findUnique({ where: { username } })) {
    throw new RegistrationError("Username already taken");
  }

  const user = await db.user.create({
    data: { username, email, password: await hashPassword(password), role: "USER" },
  });
  return { id: user.id };
}
