import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { createClient } from "@supabase/supabase-js";

// Supabase admin client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // IMPORTANT: service key (never in client)
);

export async function POST(req: NextRequest) {
  try {
    const payload = await req.text();
    const svix_id = req.headers.get("svix-id");
    const svix_timestamp = req.headers.get("svix-timestamp");
    const svix_signature = req.headers.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
      console.error("Missing required headers");
      return NextResponse.json({ error: "Missing required headers" }, { status: 400 });
    }

    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);

    let evt: any;
    try {
      evt = wh.verify(payload, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as any;
    } catch (err) {
      console.error("Webhook verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const { type, data } = evt;
    console.log(`Processing webhook event: ${type}`);

    if (type === "user.created" || type === "user.updated") {
      const clerk_user_id = data.id;
      const name = `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim();
      const email = data.email_addresses?.[0]?.email_address ?? null;

      console.log(`Upserting user:`, { clerk_user_id, name, email });

      const { data: user, error } = await supabase
        .from("users")
        .upsert(
          { 
            clerk_user_id, 
            name, 
            email,
            updated_at: new Date().toISOString()
          },
          { onConflict: "clerk_user_id" }
        )
        .select();

      if (error) {
        console.error("Supabase upsert error:", error);
        return NextResponse.json(
          { error: "Failed to update user in database" },
          { status: 500 }
        );
      }

      console.log("User upserted successfully:", user);
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Unexpected error in webhook handler:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
