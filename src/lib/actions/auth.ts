"use server";
import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";
import { registerUser, RegistrationError } from "@/lib/users";

export type RegisterState = { error?: string };

export async function registerAction(
  _prev: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const username = String(formData.get("username") ?? "");
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  try {
    await registerUser({ username, email, password });
  } catch (e) {
    if (e instanceof RegistrationError) return { error: e.message };
    return { error: "Registration failed. Please try again." };
  }

  try {
    await signIn("credentials", { email, password, redirectTo: "/" });
  } catch (e) {
    // signIn throws a redirect on success — let it propagate.
    if (e instanceof AuthError) return { error: "Account created — please log in." };
    throw e;
  }
  return {};
}
