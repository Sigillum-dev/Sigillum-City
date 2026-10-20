import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAgentById } from "@/lib/supabase/queries";
import { isUuid } from "@/lib/api-errors";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!isUuid(id)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const supabase = await createClient();
  const { data, error } = await getAgentById(supabase, id);

  if (error || !data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ agent: data });
}
