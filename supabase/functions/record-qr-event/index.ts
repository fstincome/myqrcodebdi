import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Body = {
  id: string;
  url: string;
  kind: "scanned" | "generated";
  caption: string | null;
};

function isValidHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return (parsed.protocol === "http:" || parsed.protocol === "https:") && Boolean(parsed.hostname);
  } catch {
    return false;
  }
}

function parseBody(raw: unknown): Body | null {
  if (typeof raw !== "object" || raw === null) return null;
  const b = raw as Record<string, unknown>;
  if (typeof b.id !== "string" || !UUID_RE.test(b.id)) return null;
  if (typeof b.url !== "string" || b.url.length === 0 || b.url.length > 2048 || !isValidHttpUrl(b.url)) return null;
  if (b.kind !== "scanned" && b.kind !== "generated") return null;
  if (b.caption !== null && (typeof b.caption !== "string" || b.caption.length > 200)) return null;
  return { id: b.id, url: b.url, kind: b.kind, caption: b.caption };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const raw = await req.json();
    const body = parseBody(raw);
    if (!body) {
      return new Response(JSON.stringify({ error: "invalid_body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );

    // Idempotent on the event id: retries of the same event are no-ops.
    const { error } = await supabase.from("qr_history").upsert(body, { onConflict: "id", ignoreDuplicates: true });
    if (error) {
      console.error("record-qr-event insert failed:", error.message);
      return new Response(JSON.stringify({ saved: false, error: "insert_failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ saved: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ error: "bad_request" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
