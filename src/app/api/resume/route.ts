import { NextResponse } from "next/server";

import { createClient } from "@supabase/supabase-js";
import { ensureDBUser } from "@/lib/ensureDbUser"; 

const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface Resume {
  id: string;
  created_at: string;
  file_url: string;
}

export async function GET() {
  try {
    // Ensure Clerk user exists in DB
    const user = await ensureDBUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch resumes for this user from Supabase
    const { data: resumes, error } = await supabaseServer
      .from("resumes")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching resumes:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Sign each file URL with Supabase
    const signedResumes = await Promise.all(
      (resumes || []).map(async (resume: Resume) => {
        const { data } = await supabaseServer.storage
          .from("resumes")
          .createSignedUrl(resume.file_url, 60 * 60); // 1h expiration

        return {
          id: resume.id,
          createdAt: resume.created_at,
          url: data?.signedUrl || "",
        };
      })
    );

    return NextResponse.json({ resumes: signedResumes });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
