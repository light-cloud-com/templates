import { pool } from "@/lib/db";

export const dynamic = "force-dynamic";

/** 200 when the database answers, 503 when it does not. */
export async function GET() {
  try {
    await pool.query("select 1");
    return Response.json({ status: "ok", database: "ok" });
  } catch (err) {
    console.error(`Health check failed: ${(err as Error).message}`);
    return Response.json({ status: "error", database: "unreachable" }, { status: 503 });
  }
}
