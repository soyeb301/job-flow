import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth";
import { createClient } from "@supabase/supabase-js";

const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function ensureDBUser() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return null;
  }

  const { data: user, error } = await supabaseServer
    .from("users")
    .select("*")
    .eq("id", session.user.id)
    .single();

  if (error || !user) {
    return null;
  }

  return user;
}
