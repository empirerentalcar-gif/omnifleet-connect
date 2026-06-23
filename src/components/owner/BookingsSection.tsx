import { Fragment, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, CheckCircle2, XCircle, Loader2, ChevronDown, ChevronRight } from "lucide-react";
import { BookingPaymentDetails } from "./BookingPaymentDetails";

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
  stripe_charge_id: string | null;
  decline_reason: string | null;
  created_at: string;
  updated_at: string;
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
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
      const { data, error } = await supabase.functions.invoke("capture-booking-payment", { body: { booking_id: b.id } });
      if (error) throw new Error(error.message);
      const already = (data as { already_captured?: boolean; message?: string } | null)?.already_captured;
      toast({
        title: already ? "Payment already captured" : "Booking confirmed",
        description: already
          ? (data as { message?: string }).message ?? "Payment already captured and confirmed. Your payout is processing."
          : "Card captured successfully.",
      });
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
                const awaitingAuth = b.booking_status === "pending_agency" && b.payment_status === "scheduled";
                const canDecline = b.booking_status === "pending_agency";
                const hasPaymentDetails = b.payment_status === "succeeded" || !!b.stripe_charge_id;
                const isExpanded = expandedId === b.id;
                return (
                  <Fragment key={b.id}>
                  <tr>
                    <td className="px-4 py-3">
                      <div className="flex items-start gap-2">
                        {hasPaymentDetails && (
                          <button
                            type="button"
                            onClick={() => setExpandedId(isExpanded ? null : b.id)}
                            className="mt-0.5 text-muted-foreground hover:text-foreground"
                            aria-label={isExpanded ? "Hide payment details" : "Show payment details"}
                          >
                            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          </button>
                        )}
                        <div>
                          <p className="font-medium">{b.renter_name}</p>
                      <p className="text-xs text-muted-foreground">{b.renter_email} · {b.renter_phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {b.pickup_date}<br />to {b.dropoff_date}<br />
                      <span className="text-muted-foreground">{b.rental_days}d</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <div>Renter paid: <span className="font-medium">${(b.total_amount_cents / 100).toFixed(2)}</span></div>
                        <div className="text-xs text-muted-foreground">Zuvio fee (5%): −${(b.platform_fee_cents / 100).toFixed(2)}</div>
                        <div className="text-xs font-semibold text-primary">Your earnings: ${((b.total_amount_cents - b.platform_fee_cents) / 100).toFixed(2)}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={statusColor[b.booking_status] || "bg-secondary text-muted-foreground"}>
                        {b.booking_status.replace("_", " ")}
                      </Badge>
                      <p className="text-[10px] text-muted-foreground mt-1">{b.payment_status}</p>
                      {b.decline_reason && <p className="text-[10px] text-destructive mt-1">{b.decline_reason}</p>}
                    </td>
                    <td className="px-4 py-3">
                      {canDecline ? (
                        <div className="flex flex-col gap-1.5">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="default"
                              disabled={busyId === b.id || !canCapture}
                              onClick={() => approve(b)}
                              title={canCapture ? "Approve & authorize hold" : "Card auth pending — cannot approve yet"}
                            >
                              {busyId === b.id ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <CheckCircle2 className="h-3.5 w-3.5 mr-1" />}
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={busyId === b.id}
                              onClick={() => decline(b)}
                            >
                              <XCircle className="h-3.5 w-3.5 mr-1" />
                              Decline
                            </Button>
                          </div>
                          {awaitingAuth && (
                            <span className="text-[10px] text-muted-foreground">Card on file — auth 7d before pickup</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                  {isExpanded && hasPaymentDetails && agencyId && (
                    <tr>
                      <td colSpan={5} className="p-0">
                        <BookingPaymentDetails
                          agencyId={agencyId}
                          bookingPriceCents={b.total_amount_cents}
                          platformFeeCents={b.platform_fee_cents}
                          stripeChargeId={b.stripe_charge_id}
                          capturedAt={b.updated_at}
                          paymentStatus={b.payment_status}
                        />
                      </td>
                    </tr>
                  )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};