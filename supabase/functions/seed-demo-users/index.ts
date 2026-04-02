import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const demoUsers = [
      { email: "admin@library.com", password: "admin123", username: "admin", display_name: "Admin", role: "admin" },
      { email: "john@student.edu", password: "john123", username: "john_doe", display_name: "John Doe", role: "student" },
      { email: "jane@student.edu", password: "jane123", username: "jane_smith", display_name: "Jane Smith", role: "student" },
      { email: "mike@student.edu", password: "mike123", username: "mike_wilson", display_name: "Mike Wilson", role: "student" },
    ];

    const results = [];

    for (const user of demoUsers) {
      // Check if user already exists
      const { data: existingProfile } = await supabaseAdmin
        .from("profiles")
        .select("user_id")
        .eq("username", user.username)
        .single();

      if (existingProfile) {
        results.push({ username: user.username, status: "already exists" });
        continue;
      }

      // Create auth user
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: { username: user.username, display_name: user.display_name, role: user.role },
      });

      if (authError) {
        results.push({ username: user.username, status: "error", error: authError.message });
        continue;
      }

      // For student users, also create a student record
      if (user.role === "student" && authData.user) {
        const studentId = `STU-${user.username.toUpperCase().replace("_", "")}`;
        await supabaseAdmin.from("students").insert({
          student_id: studentId,
          name: user.display_name,
          email: user.email,
          user_id: authData.user.id,
          borrowed: 0,
          books: [],
        });
      }

      results.push({ username: user.username, status: "created", role: user.role });
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
