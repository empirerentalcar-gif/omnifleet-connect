import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Car,
  CalendarCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Reservation = {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  vehicle_type: string;
  pickup_date: string;
  dropoff_date: string;
  status: string;
  notes: string | null;
  created_at: string;
  agency_name: string;
};

type Vehicle = {
  id: string;
  make: string;
  model: string;
  year: number;
  vehicle_type: string;
  daily_rate: number;
  status: string;
  location_city: string | null;
  location_state: string | null;
};

type Profile = {
  id: string;
  business_name: string;
  contact_email: string;
  contact_phone: string | null;
  city: string | null;
  state: string | null;
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  approved: "bg-primary/20 text-primary border-primary/30",
  vehicle_ready: "bg-accent/20 text-accent border-accent/30",
  declined: "bg-destructive/20 text-destructive border-destructive/30",
};

const OwnerDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/signin");
    }
  }, [authLoading, user, navigate]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);

    const { data: profileData } = await supabase
      .from("profiles")
      .select("id, business_name, contact_email, contact_phone, city, state")
      .eq("user_id", user.id)
      .single();

    if (profileData) {
      setProfile(profileData);

      const [resResult, vehResult] = await Promise.all([
        supabase
          .from("reservation_requests")
          .select("*")
          .eq("profile_id", profileData.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("vehicles")
          .select("id, make, model, year, vehicle_type, daily_rate, status, location_city, location_state")
          .eq("profile_id", profileData.id)
          .order("created_at", { ascending: false }),
      ]);

      setReservations((resResult.data as Reservation[]) || []);
      setVehicles((vehResult.data as Vehicle[]) || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const updateStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    const { error } = await supabase
      .from("reservation_requests")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Updated", description: `Reservation ${newStatus}` });
      setReservations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
      );
    }
    setUpdatingId(null);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  const pending = reservations.filter((r) => r.status === "pending");
  const active = reservations.filter((r) => ["approved", "vehicle_ready"].includes(r.status));

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                {profile?.business_name || "My Agency"}
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                {profile?.city && profile?.state
                  ? `${profile.city}, ${profile.state}`
                  : "Owner Dashboard"}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={fetchData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {[
              { label: "Vehicles", value: vehicles.length, icon: Car },
              { label: "Pending", value: pending.length, icon: Clock },
              { label: "Active", value: active.length, icon: CalendarCheck },
              { label: "Total Requests", value: reservations.length, icon: CheckCircle2 },
            ].map((s) => (
              <div key={s.label} className="glass-card rounded-xl p-5">
                <s.icon className="h-5 w-5 text-primary mb-2" />
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Pending Reservations */}
          <section className="mb-12">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-400" />
              Pending Requests
              {pending.length > 0 && (
                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 ml-2">
                  {pending.length}
                </Badge>
              )}
            </h2>
            {pending.length === 0 ? (
              <div className="glass-card rounded-xl p-8 text-center text-muted-foreground">
                No pending reservation requests.
              </div>
            ) : (
              <div className="space-y-4">
                {pending.map((r) => (
                  <ReservationCard
                    key={r.id}
                    reservation={r}
                    updatingId={updatingId}
                    onApprove={() => updateStatus(r.id, "approved")}
                    onDecline={() => updateStatus(r.id, "declined")}
                  />
                ))}
              </div>
            )}
          </section>

          {/* All Reservations */}
          <section className="mb-12">
            <h2 className="text-xl font-bold mb-4">All Reservations</h2>
            {reservations.length === 0 ? (
              <div className="glass-card rounded-xl p-8 text-center text-muted-foreground">
                No reservations yet. They'll appear here when customers submit requests.
              </div>
            ) : (
              <div className="space-y-3">
                {reservations.map((r) => (
                  <ReservationCard
                    key={r.id}
                    reservation={r}
                    updatingId={updatingId}
                    onApprove={
                      r.status === "pending" ? () => updateStatus(r.id, "approved") : undefined
                    }
                    onDecline={
                      r.status === "pending" ? () => updateStatus(r.id, "declined") : undefined
                    }
                    onMarkReady={
                      r.status === "approved"
                        ? () => updateStatus(r.id, "vehicle_ready")
                        : undefined
                    }
                  />
                ))}
              </div>
            )}
          </section>

          {/* Vehicles */}
          <section>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Car className="h-5 w-5 text-primary" />
              My Vehicles
            </h2>
            {vehicles.length === 0 ? (
              <div className="glass-card rounded-xl p-8 text-center text-muted-foreground">
                No vehicles added yet.
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {vehicles.map((v) => (
                  <div key={v.id} className="glass-card rounded-xl p-5">
                    <p className="font-semibold">
                      {v.year} {v.make} {v.model}
                    </p>
                    <p className="text-sm text-muted-foreground capitalize">{v.vehicle_type}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-primary font-bold">${v.daily_rate}/day</span>
                      <Badge
                        className={
                          v.status === "available"
                            ? "bg-accent/20 text-accent border-accent/30"
                            : "bg-secondary text-muted-foreground"
                        }
                      >
                        {v.status}
                      </Badge>
                    </div>
                    {v.location_city && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {v.location_city}, {v.location_state}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

const ReservationCard = ({
  reservation: r,
  updatingId,
  onApprove,
  onDecline,
  onMarkReady,
}: {
  reservation: Reservation;
  updatingId: string | null;
  onApprove?: () => void;
  onDecline?: () => void;
  onMarkReady?: () => void;
}) => (
  <div className="glass-card rounded-xl p-5">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1">
          <p className="font-semibold truncate">{r.customer_name}</p>
          <Badge className={statusColors[r.status] || "bg-secondary text-muted-foreground"}>
            {r.status.replace("_", " ")}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {r.vehicle_type} · {r.pickup_date} → {r.dropoff_date}
        </p>
        <p className="text-sm text-muted-foreground">
          📞 {r.customer_phone}
          {r.customer_email && ` · ✉ ${r.customer_email}`}
        </p>
        {r.notes && (
          <p className="text-xs text-muted-foreground mt-1 italic">"{r.notes}"</p>
        )}
      </div>
      <div className="flex gap-2 shrink-0">
        {onApprove && (
          <Button
            size="sm"
            onClick={onApprove}
            disabled={updatingId === r.id}
          >
            <CheckCircle2 className="h-4 w-4 mr-1" />
            Approve
          </Button>
        )}
        {onDecline && (
          <Button
            size="sm"
            variant="destructive"
            onClick={onDecline}
            disabled={updatingId === r.id}
          >
            <XCircle className="h-4 w-4 mr-1" />
            Decline
          </Button>
        )}
        {onMarkReady && (
          <Button
            size="sm"
            variant="outline"
            className="border-accent/30 text-accent hover:bg-accent/10"
            onClick={onMarkReady}
            disabled={updatingId === r.id}
          >
            <Car className="h-4 w-4 mr-1" />
            Vehicle Ready
          </Button>
        )}
      </div>
    </div>
  </div>
);

export default OwnerDashboard;
