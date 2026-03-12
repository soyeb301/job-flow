import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { ensureDBUser } from "@/lib/ensureDbUser";

const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const user = await ensureDBUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { data: job, error } = await supabaseServer
      .from("jobs")
      .insert({
        user_id: user.id,
        ...body,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "Failed to create job" }, { status: 500 });
    }

    return NextResponse.json(job, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create job" }, { status: 500 });
  }
}

export async function GET() {
  const user = await ensureDBUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data: jobs, error } = await supabaseServer
      .from("jobs")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
    }

    return NextResponse.json(jobs);
  } catch {
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
  }
}
