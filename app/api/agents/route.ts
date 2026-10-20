import { dbError } from "@/lib/api-errors";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { listAgents } from "@/lib/supabase/queries";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await listAgents(supabase);

  if (error) {
    return dbError(error, "GET /api/agents");
  }

  return NextResponse.json({ agents: data });
}
