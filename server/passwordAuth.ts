import { randomBytes, scrypt as scryptCallback, timingSafeEqual, type ScryptOptions } from "node:crypto";

const scrypt = (password: string, salt: string, keyLength: number, options: ScryptOptions) =>
  new Promise<Buffer>((resolve, reject) => scryptCallback(password, salt, keyLength, options, (error, derivedKey) => error ? reject(error) : resolve(derivedKey)));
const KEY_LENGTH = 64;
const COST = 16384;
const BLOCK_SIZE = 8;
const PARALLELIZATION = 1;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = await scrypt(password, salt, KEY_LENGTH, {
    N: COST,
    r: BLOCK_SIZE,
    p: PARALLELIZATION,
  });
  return `scrypt$${COST}$${BLOCK_SIZE}$${PARALLELIZATION}$${salt}$${derivedKey.toString("hex")}`;
}

export async function verifyPassword(password: string, encoded: string): Promise<boolean> {
  const [algorithm, cost, blockSize, parallelization, salt, expectedHex] = encoded.split("$");
  if (algorithm !== "scrypt" || !cost || !blockSize || !parallelization || !salt || !expectedHex) return false;
  try {
    const expected = Buffer.from(expectedHex, "hex");
    const actual = await scrypt(password, salt, expected.length, {
      N: Number(cost),
      r: Number(blockSize),
      p: Number(parallelization),
    });
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function validateCredentials(email: string, password: string): string | null {
  if (!/^\S+@\S+\.\S+$/.test(normalizeEmail(email))) return "Enter a valid email address.";
  if (password.length < 8) return "Password must be at least 8 characters.";
  return null;
}

export function emailOpenId(email: string): string {
  return `email:${normalizeEmail(email)}`;
}

export const PASSWORD_PARAMS = { cost: COST, blockSize: BLOCK_SIZE, parallelization: PARALLELIZATION } as const;

type PasswordUser = { email: string | null; passwordHash: string | null };
export function isPasswordUser(user: PasswordUser | undefined): user is PasswordUser & { email: string; passwordHash: string } {
  return Boolean(user?.email && user.passwordHash);
}
