import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Info } from "lucide-react";

interface InquiryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicleId: string;
  vehicleLabel: string;
  agencyName?: string | null;
}

/**
 * Inquiry-only flow for vehicles whose agency has not finished Stripe setup.
 * No payment is taken and nothing is reserved — this creates a lead only.
 */
export const InquiryDrawer = ({
  open,
  onOpenChange,
  vehicleId,
  vehicleLabel,
  agencyName,
}: InquiryDrawerProps) => {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const today = new Date().toISOString().slice(0, 10);
  const [pickupDate, setPickupDate] = useState("");
  const [dropoffDate, setDropoffDate] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!open) {
      setSubmitting(false);
      setSent(false);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickupDate || !dropoffDate || new Date(dropoffDate) <= new Date(pickupDate)) {
      toast({ title: "Please choose a valid pickup and return date.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-vehicle-inquiry", {
        body: {
          vehicle_id: vehicleId,
          pickup_date: pickupDate,
          dropoff_date: dropoffDate,
          renter_name: name,
          renter_email: email,
          renter_phone: phone,
          message: message || undefined,
        },
      });
      if (error) throw new Error(error.message);
      if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);
      setSent(true);
      toast({
        title: "Request sent",
        description: "The agency will contact you to confirm availability and payment.",
      });
    } catch (err) {
      toast({
        title: "Couldn't send your request",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className="overflow-y-auto sm:max-w-lg"
        style={{ backgroundColor: "#0d1b2e", color: "#fff", borderColor: "rgba(45,212,191,0.3)" }}
      >
        <SheetHeader>
          <SheetTitle className="text-white">Request this vehicle — {vehicleLabel}</SheetTitle>
          <SheetDescription className="text-white/60">
            {agencyName ?? "The agency"} will contact you to confirm availability and payment. This
            is a request, not a confirmed reservation, and no payment is collected here.
          </SheetDescription>
        </SheetHeader>

        {sent ? (
          <div className="mt-8 space-y-3 text-center">
            <p className="text-lg font-bold text-white">Your request was sent</p>
            <p className="text-sm text-white/70">
              Nothing is booked yet. {agencyName ?? "The agency"} will reach out directly to confirm
              availability and how to pay.
            </p>
            <Button
              onClick={() => onOpenChange(false)}
              className="w-full"
              style={{ backgroundColor: "#2dd4bf", color: "#0d1b2e" }}
            >
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <div
              className="rounded-lg p-3 text-xs text-white/70 flex gap-2"
              style={{
                backgroundColor: "rgba(251,191,36,0.1)",
                border: "1px solid rgba(251,191,36,0.35)",
              }}
            >
              <Info className="h-4 w-4 shrink-0" style={{ color: "#fbbf24" }} />
              <span>
                This agency isn't set up for online payments yet, so we can't take a booking or
                payment here. Send your details and they'll contact you directly.
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-white/80">Desired pickup</Label>
                <Input
                  type="date"
                  required
                  min={today}
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>
              <div>
                <Label className="text-white/80">Desired return</Label>
                <Input
                  type="date"
                  required
                  min={pickupDate || today}
                  value={dropoffDate}
                  onChange={(e) => setDropoffDate(e.target.value)}
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>
            </div>
            <div>
              <Label className="text-white/80">Full name</Label>
              <Input
                required
                minLength={2}
                maxLength={100}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-white/5 border-white/20 text-white"
              />
            </div>
            <div>
              <Label className="text-white/80">Email</Label>
              <Input
                type="email"
                required
                maxLength={255}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/5 border-white/20 text-white"
              />
            </div>
            <div>
              <Label className="text-white/80">Phone</Label>
              <Input
                type="tel"
                required
                maxLength={30}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-white/5 border-white/20 text-white"
              />
            </div>
            <div>
              <Label className="text-white/80">Anything the agency should know? (optional)</Label>
              <Textarea
                maxLength={1000}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="bg-white/5 border-white/20 text-white"
                rows={3}
              />
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full"
              style={{ backgroundColor: "#2dd4bf", color: "#0d1b2e" }}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending…
                </>
              ) : (
                "Send request"
              )}
            </Button>
            <p className="text-xs text-white/50">
              Sending this does not reserve the vehicle and does not charge you.
            </p>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
};
