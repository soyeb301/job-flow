import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { PdfReader } from "pdfreader";
import { ensureDBUser } from "@/lib/ensureDbUser";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    // ✅ Clerk auth
    const user = await ensureDBUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { resumeId } = await req.json();
    if (!resumeId) {
      return NextResponse.json({ error: "Missing resume ID" }, { status: 400 });
    }

    // Fetch resume from Supabase
    const { data: resume, error: resumeError } = await supabase
      .from("resumes")
      .select("*")
      .eq("id", resumeId)
      .single();

    if (resumeError || !resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    // ✅ Security check: only owner can analyze
    if (resume.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Download file from Supabase
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("resumes")
      .download(resume.file_url);

    if (downloadError || !fileData) {
      return NextResponse.json(
        { error: "Failed to download resume" },
        { status: 500 }
      );
    }

    const arrayBuffer = await fileData.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const resumeTextChunks: string[] = [];

    const parsedText = await new Promise<string>((resolve, reject) => {
      new PdfReader().parseBuffer(buffer, (err, item) => {
        if (err) return reject(err);
        if (!item) return resolve(resumeTextChunks.join(" "));
        if (item.text) resumeTextChunks.push(item.text);
      });
    });

    if (!parsedText || parsedText.trim().length < 100) {
      return NextResponse.json(
        { error: "Resume text is too short or unreadable" },
        { status: 400 }
      );
    }

    // Send text to Gemini API
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    const prompt = `You're a professional resume reviewer. Please analyze the following resume and suggest 2–3 specific improvements to make it more effective for job applications:\n\n${parsedText}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API error:", errorData);
      return NextResponse.json(
        { error: "AI analysis service failed" },
        { status: 500 }
      );
    }

    const data = await response.json();
    const suggestions =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No analysis available";

    return NextResponse.json({ analysis: suggestions });
  } catch (err) {
    console.error("Analyze error:", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
