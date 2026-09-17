import { jwtVerify, SignJWT } from "jose";
import { ONE_YEAR_MS } from "@shared/const";
import { ENV } from "./env";

const secretKey = () => new TextEncoder().encode(ENV.cookieSecret);

export async function createCustomSessionToken(openId: string, name: string): Promise<string> {
  return new SignJWT({ openId, name, appId: "fluxy-tech" })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(Math.floor((Date.now() + ONE_YEAR_MS) / 1000))
    .sign(secretKey());
}

export async function verifyCustomSessionToken(token: string | undefined): Promise<{ openId: string; name: string } | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    if (typeof payload.openId !== "string" || typeof payload.name !== "string") return null;
    return { openId: payload.openId, name: payload.name };
  } catch {
    return null;
  }
}
