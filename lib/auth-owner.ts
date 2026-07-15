import crypto from "crypto";
import { auth } from "@/auth";
import { isLocal } from "@/lib/is-local";

// Mirrors Stickies' authorizeOwner: local/LAN bypass, then a static Bearer
// secret for scripts/AI agents, then the NextAuth owner-email session.
const OWNER_EMAIL = (process.env.OWNER_EMAIL ?? process.env.ALLOWED_EMAIL)?.trim().toLowerCase();

export async function authorizeOwner(req: Request): Promise<boolean> {
  // 1. Local/LAN — no login needed in dev
  if (isLocal(req)) return true;

  // 2. Static API secret (external scripts / AI agents)
  const header = req.headers.get("authorization") ?? "";
  if (header.startsWith("Bearer ")) {
    const secrets = [process.env.AI_API_SECRET].filter(Boolean) as string[];
    for (const secret of secrets) {
      const expected = `Bearer ${secret}`;
      if (header.length === expected.length) {
        try {
          if (crypto.timingSafeEqual(Buffer.from(header), Buffer.from(expected))) return true;
        } catch { /* length mismatch — ignore */ }
      }
    }
  }

  // 3. NextAuth session cookie → only OWNER_EMAIL passes
  if (!OWNER_EMAIL) return false;
  const session = await auth();
  return session?.user?.email?.toLowerCase() === OWNER_EMAIL;
}

// The DB user_id used for the owner's rows. The legacy Supabase owner UUID is
// preserved via OWNER_USER_ID so existing diagrams keep resolving.
export function ownerId(): string | null {
  return process.env.OWNER_USER_ID?.trim() || null;
}

// Owner DB id if (and only if) the request is authorized, else null.
export async function resolveOwnerId(req: Request): Promise<string | null> {
  return (await authorizeOwner(req)) ? ownerId() : null;
}

// Server-component authorization: no Request is available, so authorize on the
// dev bypass or the NextAuth owner-email session (auth() reads cookies itself).
// The bypass only fires under a real local `next dev` (NODE_ENV=development) -
// production always requires the owner session, and no stray env var can flip it.
// Used by the server-rendered index page.
export async function resolveOwnerIdServer(): Promise<string | null> {
  const devBypass = process.env.NODE_ENV === "development";
  if (devBypass) return ownerId();
  if (!OWNER_EMAIL) return null;
  const session = await auth();
  return session?.user?.email?.toLowerCase() === OWNER_EMAIL ? ownerId() : null;
}
