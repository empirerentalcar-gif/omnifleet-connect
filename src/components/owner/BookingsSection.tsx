import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, CheckCircle2, XCircle, Loader2 } from "lucide-react";

type Booking = {
  id: string;
  renter_name: string;
  renter_email: string;
  renter_phone: string;
  pickup_date: string;
  dropoff_date: string;
  rental_days: number;
  total_amount_cents: number;
  platform_fee_cents: number;
  payment_status: string;
  booking_status: string;
  stripe_payment_intent_id: string | null;
  stripe_setup_intent_id: string | null;
  decline_reason: string | null;
  created_at: string;
};

const statusColor: Record<string, string> = {
  pending_agency: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  approved: "bg-primary/20 text-primary border-primary/30",
  declined: "bg-destructive/20 text-destructive border-destructive/30",
};

export const BookingsSection = ({ agencyId }: { agencyId: string | null }) => {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    if (!agencyId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("agency_id", agencyId)
      .order("created_at", { ascending: false });
    if (!error) setBookings((data ?? []) as Booking[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, [agencyId]);

  const approve = async (b: Booking) => {
    setBusyId(b.id);
    try {
      const { error } = await supabase.functions.invoke("capture-booking-payment", { body: { booking_id: b.id } });
      if (error) throw new Error(error.message);
      toast({ title: "Booking confirmed", description: "Card captured successfully." });
      load();
    } catch (e) {
      toast({ title: "Could not capture", description: e instanceof Error ? e.message : String(e), variant: "destructive" });
    } finally { setBusyId(null); }
  };

  const decline = async (b: Booking) => {
    const reason = window.prompt("Reason for declining (optional):") ?? undefined;
    setBusyId(b.id);
    try {
      const { error } = await supabase.functions.invoke("cancel-booking-payment", { body: { booking_id: b.id, reason } });
      if (error) throw new Error(error.message);
      toast({ title: "Booking declined", description: "Authorization released." });
      load();
    } catch (e) {
      toast({ title: "Could not decline", description: e instanceof Error ? e.message : String(e), variant: "destructive" });
    } finally { setBusyId(null); }
  };

  if (!agencyId) return null;

  return (
    <section className="mb-12">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <CreditCard className="h-5 w-5 text-primary" /> Paid Bookings
        {bookings.length > 0 && <Badge variant="secondary" className="ml-2">{bookings.length}</Badge>}
      </h2>
      {loading ? (
        <div className="glass-card rounded-xl p-8 text-center text-muted-foreground">Loading bookings…</div>
      ) : bookings.length === 0 ? (
        <div className="glass-card rounded-xl p-8 text-center text-muted-foreground">
          No paid bookings yet. They'll appear here when renters reserve a specific vehicle with a card.
        </div>
      ) : (
        <div className="glass-card rounded-xl overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/30">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Renter</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Dates</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Total</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {bookings.map((b) => {
                const canCapture = b.booking_status === "pending_agency" && b.payment_status === "requires_capture" && !!b.stripe_payment_intent_id;
                const awaitingAuth = b.payment_status === "scheduled";
                return (
                  <tr key={b.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium">{b.renter_name}</p>
                      <p className="text-xs text-muted-foreground">{b.renter_email} · {b.renter_phone}</p>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {b.pickup_date}<br />to {b.dropoff_date}<br />
                      <span className="text-muted-foreground">{b.rental_days}d</span>
                    </td>
                    <td className="px-4 py-3">
                      ${(b.total_amount_cents / 100).toFixed(2)}<br />
                      <span className="text-xs text-muted-foreground">−${(b.platform_fee_cents / 100).toFixed(2)} fee</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={statusColor[b.booking_status] || "bg-secondary text-muted-foreground"}>
                        {b.booking_status.replace("_", " ")}
                      </Badge>
                      <p className="text-[10px] text-muted-foreground mt-1">{b.payment_status}</p>
                      {b.decline_reason && <p className="text-[10px] text-destructive mt-1">{b.decline_reason}</p>}
                    </td>
                    <td className="px-4 py-3">
                      {canCapture && (
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" disabled={busyId === b.id} onClick={() => approve(b)}>
                            {busyId === b.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4 text-primary" />}
                          </Button>
                          <Button size="sm" variant="ghost" disabled={busyId === b.id} onClick={() => decline(b)}>
                            <XCircle className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      )}
                      {awaitingAuth && (
                        <span className="text-xs text-muted-foreground">Card on file — auth 7d before pickup</span>
                      )}
                      {!canCapture && !awaitingAuth && <span className="text-xs text-muted-foreground">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};