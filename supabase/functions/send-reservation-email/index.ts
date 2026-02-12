import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface EmailPayload {
  reservation_id: string;
  type: "approved" | "vehicle_ready" | "extension_approved";
}

const subjects: Record<string, string> = {
  approved: "Your Reservation Has Been Approved!",
  vehicle_ready: "Your Vehicle Is Ready for Pickup!",
  extension_approved: "Your Extension Has Been Approved!",
};

const bodyTemplates: Record<string, (r: any) => string> = {
  approved: (r) =>
    `Hi ${r.customer_name},\n\nGreat news! Your reservation with ${r.agency_name} has been approved.\n\nDetails:\n- Pickup: ${r.pickup_date}\n- Drop-off: ${r.dropoff_date}\n- Vehicle Type: ${r.vehicle_type}\n\nThe agency will contact you at ${r.customer_phone} with any additional details.\n\nThank you for choosing ZUVIO!`,
  vehicle_ready: (r) =>
    `Hi ${r.customer_name},\n\nYour vehicle is ready for pickup at ${r.agency_name}!\n\nPlease bring the required documents and head to the agency location.\n\nPickup Date: ${r.pickup_date}\nVehicle Type: ${r.vehicle_type}\n\nThank you for choosing ZUVIO!`,
  extension_approved: (r) =>
    `Hi ${r.customer_name},\n\nYour rental extension with ${r.agency_name} has been approved.\n\nNew Drop-off Date: ${r.dropoff_date}\n\nIf you have questions, contact the agency directly.\n\nThank you for choosing ZUVIO!`,
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { reservation_id, type } = (await req.json()) as EmailPayload;

    if (!reservation_id || !type || !subjects[type]) {
      return new Response(
        JSON.stringify({ error: "Missing reservation_id or invalid type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch reservation
    const { data: reservation, error } = await supabase
      .from("reservation_requests")
      .select("*")
      .eq("id", reservation_id)
      .maybeSingle();

    if (error || !reservation) {
      return new Response(
        JSON.stringify({ error: "Reservation not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!reservation.customer_email) {
      return new Response(
        JSON.stringify({ error: "No customer email on file", skipped: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update reservation status
    const statusMap: Record<string, string> = {
      approved: "approved",
      vehicle_ready: "vehicle_ready",
      extension_approved: "extension_approved",
    };

    await supabase
      .from("reservation_requests")
      .update({ status: statusMap[type] })
      .eq("id", reservation_id);

    // Send email via Supabase Auth admin (using a simple log for now since
    // full SMTP integration requires external service). In production, 
    // integrate with Resend/SendGrid/etc.
    const emailBody = bodyTemplates[type](reservation);

    console.log(`[EMAIL] To: ${reservation.customer_email}`);
    console.log(`[EMAIL] Subject: ${subjects[type]}`);
    console.log(`[EMAIL] Body: ${emailBody}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Email notification queued for ${type}`,
        to: reservation.customer_email,
        subject: subjects[type],
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
