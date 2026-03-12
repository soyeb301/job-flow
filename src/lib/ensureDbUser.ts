import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth";
import { createClient } from "@supabase/supabase-js";

const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function ensureDBUser() {
  // Get the NextAuth session
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    console.log("ensureDBUser: No session found");
    return null;
  }

  const userId = session.user.id;
  console.log("ensureDBUser: Looking for user with id:", userId);

  // Find user by id
  const { data: existingUser, error: findError } = await supabaseServer
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (findError && findError.code !== "PGRST116") {
    console.error("Error finding user:", findError);
    return null;
  }

  console.log("ensureDBUser: existingUser:", existingUser);

  // Return the user if found
  if (existingUser) {
    return existingUser;
  }

  console.log("ensureDBUser: User not found in database");
  return null;
}
