import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Car,
  CalendarCheck,
  CalendarIcon,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  RefreshCw,
  Pencil,
  Trash2,
  X,
  Upload,
  ImagePlus,
  Check,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { SafeImage } from "@/components/SafeImage";
import { cn } from "@/lib/utils";
import { StripeConnectCard } from "@/components/owner/StripeConnectCard";
import { SubscriptionCard } from "@/components/owner/SubscriptionCard";
import { BookingsSection } from "@/components/owner/BookingsSection";
import { Sparkles } from "lucide-react";

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
  images: string[] | null;
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

const vehicleTypes = ["Sedan", "SUV", "Truck", "Van", "Compact", "Luxury"];
const vehicleStatuses = ["available", "rented", "maintenance", "inactive"];

const emptyVehicle = {
  make: "",
  model: "",
  year: new Date().getFullYear(),
  vehicle_type: "Sedan",
  daily_rate: 0,
  status: "available",
  location_city: "",
  location_state: "",
};

const OwnerDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [agencyId, setAgencyId] = useState<string | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [trialInfo, setTrialInfo] = useState<{ status: string; daysLeft: number | null; isFoundingMember: boolean; foundingNumber: number | null; graceDaysLeft: number | null } | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);

  // Vehicle form state
  const [vehicleDialogOpen, setVehicleDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [vehicleForm, setVehicleForm] = useState(emptyVehicle);
  const [savingVehicle, setSavingVehicle] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/signin");
      return;
    }
    // Redirect admins away from agency dashboard
    const checkAdmin = async () => {
      const { data } = await supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' });
      if (data) navigate('/admin', { replace: true });
    };
    checkAdmin();
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

      // Fetch trial info from agencies
      const { data: agencyData } = await supabase
        .from('agencies')
        .select('id, subscription_status, trial_end_date, grace_period_end, is_founding_member, founding_member_number')
        .eq('owner_user_id', user.id)
        .single();

      if (agencyData) {
        // BookingsSection needs the agencies.id (not profiles.id)
        setAgencyId(agencyData.id);
        const daysLeft = agencyData.trial_end_date
          ? Math.ceil((new Date(agencyData.trial_end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          : null;
        const graceDaysLeft = agencyData.grace_period_end
          ? Math.ceil((new Date(agencyData.grace_period_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          : null;
        setTrialInfo({
          status: agencyData.subscription_status || 'trial',
          daysLeft,
          isFoundingMember: agencyData.is_founding_member || false,
          foundingNumber: agencyData.founding_member_number || null,
          graceDaysLeft,
        });
      }

      const [resResult, vehResult] = await Promise.all([
        supabase
          .from("reservation_requests")
          .select("*")
          .eq("profile_id", profileData.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("vehicles")
          .select("id, make, model, year, vehicle_type, daily_rate, status, location_city, location_state, images")
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

      // Trigger email notification for status changes
      if (["approved", "vehicle_ready"].includes(newStatus)) {
        try {
          await supabase.functions.invoke("send-reservation-email", {
            body: { reservation_id: id, type: newStatus },
          });
        } catch (e) {
          console.error("Email notification failed:", e);
        }
      }
    }
    setUpdatingId(null);
  };

  // Vehicle CRUD
  const isAccountBlocked =
    !!trialInfo &&
    (trialInfo.status === "expired" ||
      (trialInfo.status === "payment_required" &&
        (trialInfo.graceDaysLeft === null || trialInfo.graceDaysLeft <= 0)));

  const openAddVehicle = () => {
    if (isAccountBlocked) {
      toast({
        title: "Subscription required",
        description:
          "Subscribe or update your payment method in the Billing section to add vehicles.",
        variant: "destructive",
      });
      return;
    }
    setEditingVehicle(null);
    setVehicleForm(emptyVehicle);
    setVehicleDialogOpen(true);
  };

  const openEditVehicle = (v: Vehicle) => {
    setEditingVehicle(v);
    setVehicleForm({
      make: v.make,
      model: v.model,
      year: v.year,
      vehicle_type: v.vehicle_type,
      daily_rate: v.daily_rate,
      status: v.status,
      location_city: v.location_city || "",
      location_state: v.location_state || "",
    });
    setVehicleDialogOpen(true);
  };

  const saveVehicle = async () => {
    if (!profile) return;
    setSavingVehicle(true);

    if (editingVehicle) {
      const { error } = await supabase
        .from("vehicles")
        .update({
          make: vehicleForm.make,
          model: vehicleForm.model,
          year: vehicleForm.year,
          vehicle_type: vehicleForm.vehicle_type,
          daily_rate: vehicleForm.daily_rate,
          status: vehicleForm.status as any,
          location_city: vehicleForm.location_city || null,
          location_state: vehicleForm.location_state || null,
        })
        .eq("id", editingVehicle.id);

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Vehicle updated" });
        setVehicleDialogOpen(false);
        fetchData();
      }
    } else {
      const { error } = await supabase.from("vehicles").insert({
        profile_id: profile.id,
        make: vehicleForm.make,
        model: vehicleForm.model,
        year: vehicleForm.year,
        vehicle_type: vehicleForm.vehicle_type,
        daily_rate: vehicleForm.daily_rate,
        status: vehicleForm.status as any,
        location_city: vehicleForm.location_city || null,
        location_state: vehicleForm.location_state || null,
      });

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Vehicle added" });
        setVehicleDialogOpen(false);
        fetchData();
      }
    }
    setSavingVehicle(false);
  };

  const deleteVehicle = async (id: string) => {
    const { error } = await supabase.from("vehicles").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Vehicle removed" });
      setVehicles((prev) => prev.filter((v) => v.id !== id));
    }
  };

  // Photo upload (max 5 per vehicle)
  const [uploadingPhotoId, setUploadingPhotoId] = useState<string | null>(null);
  const MAX_PHOTOS = 5;

  // Pre-submit staging checklist (per-vehicle)
  type StagedFile = {
    file: File;
    typeOk: boolean;
    sizeOk: boolean;
    countOk: boolean;
    isHeic: boolean;
  };
  const [stagedByVehicle, setStagedByVehicle] = useState<Record<string, StagedFile[]>>({});
  const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  const MAX_BYTES = 10 * 1024 * 1024;

  const stagePhotos = (vehicle: Vehicle, files: FileList) => {
    const existingCount = (vehicle.images || []).length;
    const remaining = MAX_PHOTOS - existingCount;
    const arr = Array.from(files);
    const staged: StagedFile[] = arr.map((file, idx) => {
      const isHeic = /\.(heic|heif)$/i.test(file.name) || file.type === "image/heic" || file.type === "image/heif";
      const typeOk = !isHeic && (ALLOWED_TYPES.includes(file.type.toLowerCase()) || /\.(jpe?g|png|webp)$/i.test(file.name));
      const sizeOk = file.size <= MAX_BYTES;
      const countOk = idx < remaining;
      return { file, typeOk, sizeOk, countOk, isHeic };
    });
    setStagedByVehicle((prev) => ({ ...prev, [vehicle.id]: staged }));
  };

  const removeStaged = (vehicleId: string, index: number) => {
    setStagedByVehicle((prev) => {
      const list = (prev[vehicleId] || []).filter((_, i) => i !== index);
      // Recompute countOk based on new positions
      const next = list.map((s, i) => ({ ...s, countOk: i < MAX_PHOTOS }));
      return { ...prev, [vehicleId]: next };
    });
  };

  const submitStaged = async (vehicle: Vehicle) => {
    const staged = stagedByVehicle[vehicle.id] || [];
    const valid = staged.filter((s) => s.typeOk && s.sizeOk && s.countOk);
    if (!valid.length) {
      toast({ title: "Nothing to upload", description: "All staged files failed validation. Remove them or pick new ones.", variant: "destructive" });
      return;
    }
    const dt = new DataTransfer();
    valid.forEach((s) => dt.items.add(s.file));
    await uploadVehiclePhotos(vehicle, dt.files);
    setStagedByVehicle((prev) => ({ ...prev, [vehicle.id]: [] }));
  };

  const formatBytes = (n: number) => (n < 1024 * 1024 ? `${(n / 1024).toFixed(0)} KB` : `${(n / 1024 / 1024).toFixed(1)} MB`);

  const uploadVehiclePhotos = async (vehicle: Vehicle, files: FileList) => {
    if (!user || !files.length) return;
    const existing = vehicle.images || [];
    const remaining = MAX_PHOTOS - existing.length;
    if (remaining <= 0) {
      toast({ title: "Limit reached", description: `Maximum ${MAX_PHOTOS} photos per vehicle.`, variant: "destructive" });
      return;
    }
    const all = Array.from(files);
    const ALLOWED = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const MAX_BYTES = 10 * 1024 * 1024;
    const heic = all.filter((f) => /\.(heic|heif)$/i.test(f.name) || f.type === "image/heic" || f.type === "image/heif");
    const tooLarge = all.filter((f) => f.size > MAX_BYTES);
    const wrongType = all.filter(
      (f) => !heic.includes(f) && !ALLOWED.includes(f.type.toLowerCase()) && !/\.(jpe?g|png|webp)$/i.test(f.name),
    );
    // Convert iPhone HEIC/HEIF photos to JPEG client-side so uploads succeed.
    const convertedHeic: File[] = [];
    const failedHeic: File[] = [];
    if (heic.length) {
      toast({ title: "Converting iPhone photos…", description: `Converting ${heic.length} HEIC photo(s) to JPG.` });
      try {
        const { default: heic2any } = await import("heic2any");
        for (const f of heic) {
          try {
            const out = await heic2any({ blob: f, toType: "image/jpeg", quality: 0.85 });
            const blob = Array.isArray(out) ? out[0] : (out as Blob);
            const newName = f.name.replace(/\.(heic|heif)$/i, ".jpg") || `${Date.now()}.jpg`;
            convertedHeic.push(new File([blob], newName, { type: "image/jpeg" }));
          } catch (err) {
            console.error("HEIC conversion failed", f.name, err);
            failedHeic.push(f);
          }
        }
      } catch (err) {
        console.error("heic2any load failed", err);
        failedHeic.push(...heic);
      }
      if (failedHeic.length) {
        toast({
          title: "Some iPhone photos couldn't convert",
          description: `${failedHeic.map((f) => f.name).join(", ")}. Open on your phone, Share → Save to Files to convert manually, then try again.`,
          variant: "destructive",
        });
      }
    }
    if (tooLarge.length) {
      toast({
        title: "Photo too large",
        description: `${tooLarge.map((f) => f.name).join(", ")} exceeds the 10MB limit. Try a smaller version.`,
        variant: "destructive",
      });
    }
    if (wrongType.length) {
      toast({
        title: "Unsupported file type",
        description: `${wrongType.map((f) => f.name).join(", ")} — only JPG, PNG, or WEBP images are accepted.`,
        variant: "destructive",
      });
    }
    const nonHeicValid = all.filter((f) => !heic.includes(f) && !tooLarge.includes(f) && !wrongType.includes(f));
    // Re-check size on converted JPEGs (they can grow); keep ones within limit.
    const convertedValid = convertedHeic.filter((f) => {
      if (f.size > MAX_BYTES) {
        toast({ title: "Converted photo too large", description: `${f.name} exceeds 10MB after conversion.`, variant: "destructive" });
        return false;
      }
      return true;
    });
    const valid = [...nonHeicValid, ...convertedValid];
    const toUpload = valid.slice(0, remaining);
    if (valid.length > remaining) {
      toast({
        title: "Some photos skipped",
        description: `Only ${remaining} more photo(s) allowed (limit ${MAX_PHOTOS}). Uploading the first ${remaining}.`,
      });
    }
    if (!toUpload.length) return;
    setUploadingPhotoId(vehicle.id);
    const newUrls: string[] = [];
    try {
      for (const file of toUpload) {
        const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
        const path = `${user.id}/${vehicle.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error: upErr } = await supabase.storage.from("vehicle-photos").upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type || undefined });
        if (upErr) {
          toast({ title: `Upload failed: ${file.name}`, description: upErr.message, variant: "destructive" });
          continue;
        }
        const { data: pub } = supabase.storage.from("vehicle-photos").getPublicUrl(path);
        newUrls.push(pub.publicUrl);
      }
      if (newUrls.length) {
        const updated = [...existing, ...newUrls];
        const { error: dbErr } = await supabase.from("vehicles").update({ images: updated }).eq("id", vehicle.id);
        if (dbErr) {
          toast({ title: "Save failed", description: dbErr.message, variant: "destructive" });
        } else {
          setVehicles((prev) => prev.map((v) => (v.id === vehicle.id ? { ...v, images: updated } : v)));
          toast({ title: "Photos uploaded", description: `${newUrls.length} photo(s) added.` });
        }
      }
    } finally {
      setUploadingPhotoId(null);
    }
  };

  const removeVehiclePhoto = async (vehicle: Vehicle, url: string) => {
    const updated = (vehicle.images || []).filter((u) => u !== url);
    const { error } = await supabase.from("vehicles").update({ images: updated }).eq("id", vehicle.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    // best-effort: delete from storage
    const marker = "/vehicle-photos/";
    const idx = url.indexOf(marker);
    if (idx !== -1) {
      const path = url.substring(idx + marker.length);
      await supabase.storage.from("vehicle-photos").remove([path]);
    }
    setVehicles((prev) => prev.map((v) => (v.id === vehicle.id ? { ...v, images: updated } : v)));
    toast({ title: "Photo removed" });
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
  const isFormValid = vehicleForm.make && vehicleForm.model && vehicleForm.year > 1900 && vehicleForm.daily_rate > 0;

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Owner Dashboard | ZUVIO" description="Manage your rental vehicles and reservation requests on ZUVIO." path="/dashboard" noindex />
<main className="pt-6 sm:pt-8 pb-16 overflow-x-hidden">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Trial Banner */}
          {trialInfo && (
            trialInfo.status === 'payment_required' ||
            trialInfo.status === 'expired' ||
            (trialInfo.status === 'trial' && trialInfo.daysLeft !== null && trialInfo.daysLeft <= (trialInfo.isFoundingMember ? 15 : 7))
          ) && (
            <div className={`rounded-lg p-4 mb-6 border ${
              trialInfo.status === 'expired' || (trialInfo.status === 'payment_required' && (trialInfo.graceDaysLeft === null || trialInfo.graceDaysLeft <= 0))
                ? 'bg-destructive/10 border-destructive/30 text-destructive' 
                : trialInfo.status === 'payment_required'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-600'
                  : trialInfo.daysLeft !== null && trialInfo.daysLeft <= 5
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-600'
                  : 'bg-primary/10 border-primary/30 text-primary'
            }`}>
              {trialInfo.status === 'expired' ? (
                <div>
                  <p className="font-bold text-lg">Your trial has ended — Subscribe to continue</p>
                  <p className="text-sm mt-1">Your vehicles are hidden from public search. Subscribe to make them visible again.</p>
                  <p className="text-sm mt-2 font-medium">
                    {trialInfo.isFoundingMember
                      ? `Founding Member #${trialInfo.foundingNumber} pricing: $79/month + 5% per confirmed booking — locked in forever.`
                      : 'Standard pricing: $79/month + 5% per confirmed booking.'}
                  </p>
                </div>
              ) : trialInfo.status === 'payment_required' ? (
                <div>
                  <p className="font-bold text-lg">Payment failed — update your payment method</p>
                  <p className="text-sm mt-1">
                    {trialInfo.graceDaysLeft !== null && trialInfo.graceDaysLeft > 0
                      ? `You have ${trialInfo.graceDaysLeft} day${trialInfo.graceDaysLeft === 1 ? '' : 's'} to fix this before your vehicles are hidden from public search.`
                      : 'Your 7-day grace period has ended. Your vehicles are now hidden from public search.'}
                  </p>
                  <p className="text-sm mt-2">Use the Manage billing button below to update your card.</p>
                </div>
              ) : (
                <div>
                  <p className="font-bold">
                    {trialInfo.daysLeft} days left in your {trialInfo.isFoundingMember ? '60-day founding member' : '60-day'} trial
                  </p>
                  <p className="text-sm mt-1">
                    {trialInfo.isFoundingMember
                      ? `As Founding Member #${trialInfo.foundingNumber}, subscribe to lock in $79/month + 5% per confirmed booking forever.`
                      : 'Subscribe before your trial ends to keep your vehicles visible. $79/month + 5% per confirmed booking.'}
                  </p>
                </div>
              )}
            </div>
          )}
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

          {/* Stripe Connect onboarding */}
          {(() => {
            const missingPhotos = vehicles.some((v) => !v.images || v.images.length === 0);
            const missingRates = vehicles.some((v) => !v.daily_rate || v.daily_rate <= 0);
            const noVehicles = vehicles.length === 0;
            if (!missingPhotos && !missingRates && !noVehicles) return null;
            const items: string[] = [];
            if (noVehicles) items.push("add your first vehicle");
            if (missingPhotos) items.push("upload photos");
            if (missingRates) items.push("set daily rates");
            return (
              <div className="rounded-xl p-5 mb-6 border border-primary/30 bg-gradient-to-r from-primary/10 to-transparent flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div className="flex-1">
                  <h2 className="font-semibold text-sm">Complete your setup to unlock your full earning potential</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your listings are live during your free trial. To start accepting paid
                    bookings, connect Stripe and {items.join(", ")}. You can keep using the
                    dashboard normally in the meantime.
                  </p>
                </div>
              </div>
            );
          })()}

          <StripeConnectCard />

          {/* Subscription / Billing */}
          <SubscriptionCard />

          {/* Paid bookings (Stripe) */}
          <BookingsSection agencyId={agencyId} />

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

          {/* All Reservations Table */}
          <section className="mb-12">
            <h2 className="text-xl font-bold mb-4">All Reservations</h2>
            {reservations.length === 0 ? (
              <div className="glass-card rounded-xl p-8 text-center text-muted-foreground">
                No reservations yet. They'll appear here when customers submit requests.
              </div>
            ) : (
              <div className="glass-card rounded-xl overflow-hidden">
                {/* Filters */}
                <div className="p-4 border-b border-border/50 space-y-3">
                  {/* Status filter tabs */}
                  <div className="flex gap-2 overflow-x-auto">
                    {[
                      { key: "all", label: "All", count: reservations.length },
                      { key: "pending", label: "Pending", count: reservations.filter(r => r.status === "pending").length },
                      { key: "approved", label: "Approved", count: reservations.filter(r => r.status === "approved").length },
                      { key: "vehicle_ready", label: "Ready", count: reservations.filter(r => r.status === "vehicle_ready").length },
                      { key: "declined", label: "Declined", count: reservations.filter(r => r.status === "declined").length },
                    ].map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setStatusFilter(tab.key)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                          statusFilter === tab.key
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                        }`}
                      >
                        {tab.label} ({tab.count})
                      </button>
                    ))}
                  </div>
                  
                  {/* Date range filter */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-muted-foreground">Filter by pickup date:</span>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn(
                            "w-[140px] justify-start text-left font-normal",
                            !dateFrom && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateFrom ? format(dateFrom, "MMM d, yyyy") : "From"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={dateFrom}
                          onSelect={setDateFrom}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                    <span className="text-muted-foreground">–</span>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn(
                            "w-[140px] justify-start text-left font-normal",
                            !dateTo && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateTo ? format(dateTo, "MMM d, yyyy") : "To"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={dateTo}
                          onSelect={setDateTo}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                    {(dateFrom || dateTo) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setDateFrom(undefined);
                          setDateTo(undefined);
                        }}
                        className="h-8 px-2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Clear
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-secondary/30">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Customer</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Vehicle</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Dates</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {reservations
                        .filter(r => {
                          // Status filter
                          if (statusFilter !== "all" && r.status !== statusFilter) return false;
                          
                          // Date range filter (by pickup_date)
                          const pickupDate = new Date(r.pickup_date);
                          if (dateFrom && pickupDate < dateFrom) return false;
                          if (dateTo) {
                            const toEndOfDay = new Date(dateTo);
                            toEndOfDay.setHours(23, 59, 59, 999);
                            if (pickupDate > toEndOfDay) return false;
                          }
                          
                          return true;
                        })
                        .map((r) => (
                        <tr key={r.id} className="hover:bg-secondary/20 transition-colors">
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium">{r.customer_name}</p>
                              <p className="text-xs text-muted-foreground">📞 {r.customer_phone}</p>
                              {r.customer_email && (
                                <p className="text-xs text-muted-foreground">✉ {r.customer_email}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-medium">{r.vehicle_type}</p>
                            {r.notes && (
                              <p className="text-xs text-muted-foreground italic max-w-[200px] truncate" title={r.notes}>
                                "{r.notes}"
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-xs">{r.pickup_date}</p>
                            <p className="text-xs text-muted-foreground">to {r.dropoff_date}</p>
                          </td>
                          <td className="px-4 py-3">
                            <Badge className={statusColors[r.status] || "bg-secondary text-muted-foreground"}>
                              {r.status.replace("_", " ")}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              {r.status === "pending" && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 px-2 text-primary hover:text-primary"
                                    onClick={() => updateStatus(r.id, "approved")}
                                    disabled={updatingId === r.id}
                                  >
                                    <CheckCircle2 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 px-2 text-destructive hover:text-destructive"
                                    onClick={() => updateStatus(r.id, "declined")}
                                    disabled={updatingId === r.id}
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                              {r.status === "approved" && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 px-2 text-accent hover:text-accent"
                                  onClick={() => updateStatus(r.id, "vehicle_ready")}
                                  disabled={updatingId === r.id}
                                >
                                  <Car className="h-4 w-4 mr-1" />
                                  Ready
                                </Button>
                              )}
                              {(r.status === "vehicle_ready" || r.status === "declined") && (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {reservations.filter(r => {
                  if (statusFilter !== "all" && r.status !== statusFilter) return false;
                  const pickupDate = new Date(r.pickup_date);
                  if (dateFrom && pickupDate < dateFrom) return false;
                  if (dateTo) {
                    const toEndOfDay = new Date(dateTo);
                    toEndOfDay.setHours(23, 59, 59, 999);
                    if (pickupDate > toEndOfDay) return false;
                  }
                  return true;
                }).length === 0 && (
                  <div className="p-8 text-center text-muted-foreground">
                    No {statusFilter === "all" ? "" : statusFilter.replace("_", " ")} reservations found
                    {(dateFrom || dateTo) && " in the selected date range"}.
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Vehicles */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Car className="h-5 w-5 text-primary" />
                My Vehicles
              </h2>
              <Dialog open={vehicleDialogOpen} onOpenChange={setVehicleDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" onClick={openAddVehicle}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Vehicle
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>{editingVehicle ? "Edit Vehicle" : "Add Vehicle"}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-2">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Make</Label>
                        <Input value={vehicleForm.make} onChange={(e) => setVehicleForm({ ...vehicleForm, make: e.target.value })} placeholder="Toyota" />
                      </div>
                      <div>
                        <Label>Model</Label>
                        <Input value={vehicleForm.model} onChange={(e) => setVehicleForm({ ...vehicleForm, model: e.target.value })} placeholder="Camry" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Year</Label>
                        <Input type="number" value={vehicleForm.year} onChange={(e) => setVehicleForm({ ...vehicleForm, year: parseInt(e.target.value) || 0 })} />
                      </div>
                      <div>
                        <Label>Daily Rate ($)</Label>
                        <Input type="number" value={vehicleForm.daily_rate} onChange={(e) => setVehicleForm({ ...vehicleForm, daily_rate: parseFloat(e.target.value) || 0 })} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Vehicle Type</Label>
                        <Select value={vehicleForm.vehicle_type} onValueChange={(v) => setVehicleForm({ ...vehicleForm, vehicle_type: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {vehicleTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Status</Label>
                        <Select value={vehicleForm.status} onValueChange={(v) => setVehicleForm({ ...vehicleForm, status: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {vehicleStatuses.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>City</Label>
                        <Input value={vehicleForm.location_city} onChange={(e) => setVehicleForm({ ...vehicleForm, location_city: e.target.value })} placeholder="Miami" />
                      </div>
                      <div>
                        <Label>State</Label>
                        <Input value={vehicleForm.location_state} onChange={(e) => setVehicleForm({ ...vehicleForm, location_state: e.target.value })} placeholder="FL" />
                      </div>
                    </div>
                    <Button className="w-full" onClick={saveVehicle} disabled={!isFormValid || savingVehicle}>
                      {savingVehicle ? "Saving..." : editingVehicle ? "Update Vehicle" : "Add Vehicle"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            {vehicles.length === 0 ? (
              <div className="glass-card rounded-xl p-8 text-center text-muted-foreground">
                No vehicles added yet. Click "Add Vehicle" to list your first one.
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {vehicles.map((v) => (
                  <div key={v.id} className="glass-card rounded-xl p-5 group">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold">
                          {v.year} {v.make} {v.model}
                        </p>
                        <p className="text-sm text-muted-foreground capitalize">{v.vehicle_type}</p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditVehicle(v)} aria-label="Edit vehicle">
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => deleteVehicle(v.id)} aria-label="Delete vehicle">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
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

                    {(v.status === "maintenance" || v.status === "inactive") && (
                      <p className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-md px-2 py-1.5 mt-2">
                        This vehicle is set to <strong className="capitalize">{v.status}</strong> and won't appear in public search. Edit it and change status to <strong>Available</strong> to list it.
                      </p>
                    )}

                    {/* Photos */}
                    <div className="mt-4 pt-4 border-t border-border/40">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-muted-foreground">
                          Photos ({(v.images || []).length}/{MAX_PHOTOS})
                        </p>
                        {(v.images || []).length < MAX_PHOTOS && (
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif"
                              multiple
                              className="hidden"
                              disabled={uploadingPhotoId === v.id}
                              onChange={(e) => {
                                if (e.target.files) stagePhotos(v, e.target.files);
                                e.target.value = "";
                              }}
                            />
                            <span className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                              {uploadingPhotoId === v.id ? (
                                <>Uploading...</>
                              ) : (
                                <>
                                  <Upload className="h-3 w-3" /> Add
                                </>
                              )}
                            </span>
                          </label>
                        )}
                      </div>
                      {(stagedByVehicle[v.id]?.length ?? 0) > 0 && (
                        <div className="mb-3 rounded-md border border-border/60 bg-secondary/20 p-3">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-semibold">Pre-upload checklist</p>
                            <p className="text-[10px] text-muted-foreground">
                             JPG/PNG/WEBP/HEIC · ≤10MB · max {MAX_PHOTOS - (v.images || []).length} more
                            </p>
                          </div>
                          <ul className="space-y-1.5">
                            {stagedByVehicle[v.id].map((s, idx) => {
                              const ok = s.typeOk && s.sizeOk && s.countOk;
                              const issues: string[] = [];
                              if (!s.typeOk) issues.push(s.isHeic ? "HEIC not supported" : "wrong type");
                              if (!s.sizeOk) issues.push(`${formatBytes(s.file.size)} > 10MB`);
                              if (!s.countOk) issues.push("over photo limit");
                              return (
                                <li key={idx} className="flex items-center gap-2 text-xs">
                                  {ok ? (
                                    <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                                  ) : (
                                    <AlertCircle className="h-3.5 w-3.5 text-destructive shrink-0" />
                                  )}
                                  <span className="truncate flex-1" title={s.file.name}>{s.file.name}</span>
                                  <span className={cn("text-[10px]", ok ? "text-emerald-400" : "text-destructive")}>
                                    {ok ? "Ready" : issues.join(", ")}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => removeStaged(v.id, idx)}
                                    className="text-muted-foreground hover:text-destructive"
                                    aria-label={`Remove ${s.file.name}`}
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                          <div className="flex items-center justify-end gap-2 mt-3">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setStagedByVehicle((p) => ({ ...p, [v.id]: [] }))}
                              disabled={uploadingPhotoId === v.id}
                            >
                              Clear
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => submitStaged(v)}
                              disabled={
                                uploadingPhotoId === v.id ||
                                !(stagedByVehicle[v.id] || []).some((s) => s.typeOk && s.sizeOk && s.countOk)
                              }
                            >
                              {uploadingPhotoId === v.id
                                ? "Uploading..."
                                : `Upload ${(stagedByVehicle[v.id] || []).filter((s) => s.typeOk && s.sizeOk && s.countOk).length} valid`}
                            </Button>
                          </div>
                        </div>
                      )}
                      {(v.images || []).length === 0 ? (
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                            multiple
                            className="hidden"
                            disabled={uploadingPhotoId === v.id}
                            onChange={(e) => {
                              if (e.target.files) stagePhotos(v, e.target.files);
                              e.target.value = "";
                            }}
                          />
                          <div className="flex flex-col items-center justify-center gap-1 py-4 rounded-lg border border-dashed border-border/60 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors">
                            <ImagePlus className="h-5 w-5" />
                           <span className="text-xs">Upload up to 5 photos (JPG/PNG/WEBP/HEIC, max 10MB each)</span>
                          </div>
                        </label>
                      ) : (
                        <div className="grid grid-cols-3 gap-2">
                          {(v.images || []).map((url) => (
                            <div key={url} className="relative group/photo aspect-square rounded-md overflow-hidden bg-secondary/30">
                              <SafeImage src={url} alt="Vehicle" className="w-full h-full object-cover" compact />
                              <button
                                type="button"
                                onClick={() => removeVehiclePhoto(v, url)}
                                className="absolute top-1 right-1 bg-background/80 hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover/photo:opacity-100 transition-opacity"
                                aria-label="Remove photo"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

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
