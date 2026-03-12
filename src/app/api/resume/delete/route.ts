import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { ensureDBUser } from "@/lib/ensureDbUser";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface DeleteRequestBody {
  resumeId: string;
}

export async function POST(req: Request) {
  // ✅ Ensure Clerk user exists in DB
  const user = await ensureDBUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body: DeleteRequestBody = await req.json();

    // Find resume in Supabase
    const { data: resume, error: findError } = await supabase
      .from("resumes")
      .select("*")
      .eq("id", body.resumeId)
      .single();

    if (findError || !resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    // ✅ Ensure the resume belongs to the logged-in user
    if (resume.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete from Supabase storage
    const { error: supabaseError } = await supabase.storage
      .from("resumes")
      .remove([resume.file_url]);

    if (supabaseError) {
      throw supabaseError;
    }

    // Delete from Supabase database
    const { error: deleteError } = await supabase
      .from("resumes")
      .delete()
      .eq("id", resume.id);

    if (deleteError) {
      console.error("Error deleting resume from database:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete resume record" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
