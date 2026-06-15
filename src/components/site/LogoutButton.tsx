"use client";
import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ redirectTo: "/" })}
      className="text-sm font-medium text-gray-600 hover:text-primary"
    >
      Log out
    </button>
  );
}
