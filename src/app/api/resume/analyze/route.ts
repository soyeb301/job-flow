import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { PdfReader } from "pdfreader";
import OpenAI from "openai";
import { ensureDBUser } from "@/lib/ensureDbUser";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

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

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "Groq API key not configured" },
        { status: 500 }
      );
    }

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: "You are a professional resume reviewer." },
        { role: "user", content: `Please analyze the following resume and suggest 2-3 specific improvements to make it more effective for job applications:\n\n${parsedText}` },
      ],
    });

    const suggestions = response.choices[0]?.message?.content || "No analysis available";

    return NextResponse.json({ analysis: suggestions });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
