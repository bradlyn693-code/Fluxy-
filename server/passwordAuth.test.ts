import { describe, expect, it } from "vitest";
import { hashPassword, normalizeEmail, validateCredentials, verifyPassword } from "./passwordAuth";

describe("password authentication helpers", () => {
  it("hashes and verifies passwords without storing the plaintext", async () => {
    const password = "correct horse battery staple";
    const encoded = await hashPassword(password);
    expect(encoded).not.toContain(password);
    expect(await verifyPassword(password, encoded)).toBe(true);
    expect(await verifyPassword("wrong password", encoded)).toBe(false);
  });

  it("normalizes emails and validates minimum credentials", () => {
    expect(normalizeEmail("  User@Example.COM ")).toBe("user@example.com");
    expect(validateCredentials("bad", "short")).toBe("Enter a valid email address.");
    expect(validateCredentials("user@example.com", "short")).toBe("Password must be at least 8 characters.");
    expect(validateCredentials("user@example.com", "long-enough-password")).toBeNull();
  });
});
