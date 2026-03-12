import { currentUser } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function ensureDBUser() {
  // Get the logged-in Clerk user
  const clerkUser = await currentUser();
  if (!clerkUser) {
    console.log("ensureDBUser: No Clerk user found");
    return null;
  }

  // Ensure there's at least one email
  const email = clerkUser.emailAddresses?.[0]?.emailAddress;
  if (!email) {
    console.log("ensureDBUser: No email found for user");
    return null;
  }

  console.log("ensureDBUser: Looking for user with clerk_id:", clerkUser.id);

  // Try to find user by clerk_id first
  const { data: existingUser, error: findError } = await supabaseServer
    .from("users")
    .select("*")
    .eq("clerk_id", clerkUser.id)
    .single();

  if (findError && findError.code !== "PGRST116") {
    console.error("Error finding user:", findError);
    return null;
  }

  console.log("ensureDBUser: existingUser:", existingUser);

  // If user exists, return them
  if (existingUser) {
    return existingUser;
  }

  // Fallback: if not found by clerk_id, try by email
  const { data: userByEmail, error: emailError } = await supabaseServer
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (emailError && emailError.code !== "PGRST116") {
    console.error("Error finding user by email:", emailError);
    return null;
  }

  if (userByEmail) {
    // Update the user with clerk_id if found by email
    const { data: updatedUser, error: updateError } = await supabaseServer
      .from("users")
      .update({ clerk_id: clerkUser.id })
      .eq("id", userByEmail.id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating user:", updateError);
      return null;
    }
    return updatedUser;
  }

  // If user still doesn't exist, create in Supabase
  const { data: newUser, error: createError } = await supabaseServer
    .from("users")
    .insert({
      clerk_id: clerkUser.id,
      email,
      name: clerkUser.firstName ?? clerkUser.fullName ?? "",
      image: clerkUser.imageUrl ?? "",
    })
    .select()
    .single();

  if (createError) {
    console.error("Error creating user:", createError);
    return null;
  }

  return newUser;
}
