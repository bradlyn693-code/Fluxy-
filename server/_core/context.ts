import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { parse } from "cookie";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { COOKIE_NAME } from "@shared/const";
import { verifyCustomSessionToken } from "./customAuth";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(opts: CreateExpressContextOptions): Promise<TrpcContext> {
  const cookies = parse(opts.req.headers.cookie ?? "");
  let token = cookies[COOKIE_NAME];
  const authHeader = opts.req.headers.authorization;
  if (!token && typeof authHeader === "string" && authHeader.startsWith("Bearer ")) token = authHeader.slice(7);
  const session = await verifyCustomSessionToken(token);
  const user = session ? (await db.getUserByOpenId(session.openId)) ?? null : null;
  return { req: opts.req, res: opts.res, user };
}
