import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { PdfReader } from "pdfreader";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ensureDBUser } from "@/lib/ensureDbUser";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    // ✅ Clerk authentication
    const user = await ensureDBUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { resumeId, jobId } = await req.json();
    if (!resumeId || !jobId) {
      return NextResponse.json(
        { error: "Missing resume or job ID" },
        { status: 400 }
      );
    }

    // Fetch resume and job from Supabase
    const { data: resume, error: resumeError } = await supabase
      .from("resumes")
      .select("*")
      .eq("id", resumeId)
      .single();

    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", jobId)
      .single();

    if (resumeError || jobError || !resume || !job) {
      return NextResponse.json(
        { error: "Resume or Job not found" },
        { status: 404 }
      );
    }

    // ✅ Security check: resume must belong to logged-in user
    if (resume.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Download resume file from Supabase
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

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `Compare the following resume and job description. Give a match score (0–100), list key missing skills, and suggest improvements.

Resume:
${parsedText}

Job Description:
${job.description}`;

    const result = await model.generateContent(prompt);
    const matchFeedback = result.response.text();

    return NextResponse.json({ matchFeedback });
  } catch (err) {
    console.error("Match error:", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
