import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { ensureDBUser } from "@/lib/ensureDbUser";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // use service key for upload
);

interface UpdateRequestBody {
  resumeId: string;
  newFile?: File; // optional file to replace
  newName?: string; // optional metadata (e.g. renaming resume)
}

export async function PUT(req: Request) {
  const user = await ensureDBUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const resumeId = formData.get("resumeId") as string;
    const newFile = formData.get("file") as File | null;
    const newName = formData.get("name") as string | null;

    // Find resume in Supabase
    const { data: resume, error: findError } = await supabase
      .from("resumes")
      .select("*")
      .eq("id", resumeId)
      .single();

    if (findError || !resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    if (resume.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let filePath = resume.file_url;

    // ✅ If user uploaded a new file → replace in Supabase
    if (newFile) {
      // Delete old file
      await supabase.storage.from("resumes").remove([resume.file_url]);

      // Upload new file
      filePath = `resumes/${user.id}-${Date.now()}.pdf`;

      const { error: uploadError } = await supabase.storage
        .from("resumes")
        .upload(filePath, newFile, {
          contentType: "application/pdf",
          upsert: false,
        });

      if (uploadError) {
        return NextResponse.json(
          { error: uploadError.message },
          { status: 500 }
        );
      }
    }

    // ✅ Update record in Supabase
    const { data: updatedResume, error: updateError } = await supabase
      .from("resumes")
      .update({
        file_url: filePath,
      })
      .eq("id", resumeId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating resume:", updateError);
      return NextResponse.json(
        { error: "Failed to update resume" },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedResume);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
