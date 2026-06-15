import { describe, it, expect, afterAll, beforeAll } from "vitest";
import { db } from "@/lib/db";
import { registerUser, RegistrationError } from "@/lib/users";
import { verifyPassword } from "@/lib/password";

const cleanupUserIds: string[] = [];

afterAll(async () => {
  await db.user.deleteMany({ where: { id: { in: cleanupUserIds } } });
  await db.$disconnect();
});

describe("registerUser", () => {
  it("creates a USER with a hashed password", async () => {
    const email = `reg-${Date.now()}@test.local`;
    const username = `reg_${Date.now()}`;
    const { id } = await registerUser({ username, email, password: "password123" });
    cleanupUserIds.push(id);
    const row = await db.user.findUniqueOrThrow({ where: { id } });
    expect(row.role).toBe("USER");
    expect(row.password).not.toBe("password123");
    expect(await verifyPassword("password123", row.password)).toBe(true);
  });

  it("rejects a duplicate email", async () => {
    const email = `dup-${Date.now()}@test.local`;
    const a = await registerUser({ username: `u_${Date.now()}_a`, email, password: "password123" });
    cleanupUserIds.push(a.id);
    await expect(
      registerUser({ username: `u_${Date.now()}_b`, email, password: "password123" })
    ).rejects.toBeInstanceOf(RegistrationError);
  });

  it("rejects a duplicate username", async () => {
    const username = `dupname_${Date.now()}`;
    const a = await registerUser({ username, email: `a-${Date.now()}@test.local`, password: "password123" });
    cleanupUserIds.push(a.id);
    await expect(
      registerUser({ username, email: `b-${Date.now()}@test.local`, password: "password123" })
    ).rejects.toBeInstanceOf(RegistrationError);
  });

  it("rejects invalid input", async () => {
    await expect(
      registerUser({ username: "ab", email: "not-an-email", password: "short" })
    ).rejects.toBeInstanceOf(RegistrationError);
  });
});
