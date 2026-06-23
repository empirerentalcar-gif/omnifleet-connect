import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Search, Save, DollarSign, CreditCard, Car, FileText, KeyRound, CheckCircle2, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/hooks/useAdmin';
import { useAuth } from '@/hooks/useAuth';
import { useIdleSignOut } from '@/hooks/useIdleSignOut';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import AgencySearchBar, { pushRecentAgency } from '@/components/admin/AgencySearchBar';
import { PaymentSettingsForm } from '@/components/payment/PaymentSettingsForm';
import {
  emptyPaymentSettings,
  normalizePaymentSettings,
  toDbPaymentMethods,
  validatePaymentSettings,
  type PaymentSettings,
} from '@/lib/payment-settings';

interface Agency {
  id: string;
  agency_name: string;
  email: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  subscription_status: string;
  is_founding_member: boolean;
  owner_user_id: string | null;
  stripe_connect_account_id: string | null;
  stripe_connect_status: string | null;
  stripe_payouts_enabled: boolean | null;
  stripe_charges_enabled: boolean | null;
  last_payout_status: string | null;
  last_payout_amount_cents: number | null;
  last_payout_at: string | null;
  last_payout_failure_message: string | null;
}

interface OwnerProfile {
  business_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
}

interface BookingRow {
  id: string;
  pickup_date: string;
  dropoff_date: string;
  rental_days: number;
  total_amount_cents: number;
  platform_fee_cents: number;
  booking_status: string;
  payment_status: string;
  renter_name: string;
  created_at: string;
  stripe_payment_intent_id: string | null;
  vehicle: { make: string | null; model: string | null; year: number | null } | null;
}

interface NoteRow {
  id: string;
  note_text: string;
  admin_email: string;
  created_at: string;
}

interface VehicleRow {
  id: string;
  make: string | null;
  model: string | null;
  year: number | null;
  status: string;
  location_city: string | null;
  location_state: string | null;
}

const vehicleStatuses = ['available', 'inactive', 'maintenance', 'pending_review'];

const vehicleStatusBadge = (status: string) => {
  const map: Record<string, string> = {
    available: 'bg-emerald-500/20 text-emerald-600 border-emerald-500/30',
    inactive: 'bg-muted text-muted-foreground border-border',
    maintenance: 'bg-amber-500/20 text-amber-600 border-amber-500/30',
    pending_review: 'bg-sky-500/20 text-sky-600 border-sky-500/30',
  };
  return (
    <Badge className={`${map[status] || 'bg-muted text-muted-foreground border-border'} whitespace-nowrap capitalize`}>
      {status.replace('_', ' ')}
    </Badge>
  );
};

const fmtMoney = (cents: number) =>
  `$${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const subStatusBadge = (status: string) => {
  const variant =
    status === 'active'
      ? 'bg-emerald-500/20 text-emerald-600 border-emerald-500/30'
      : status === 'trial'
      ? 'bg-sky-500/20 text-sky-600 border-sky-500/30'
      : status === 'payment_required' || status === 'expired'
      ? 'bg-rose-500/20 text-rose-600 border-rose-500/30'
      : 'bg-muted text-muted-foreground border-border';
  return <Badge className={`${variant} whitespace-nowrap capitalize`}>{status.replace('_', ' ')}</Badge>;
};

const bookingStatusBadge = (status: string) => {
  const map: Record<string, string> = {
    approved: 'bg-emerald-500/20 text-emerald-600 border-emerald-500/30',
    pending_agency: 'bg-amber-500/20 text-amber-600 border-amber-500/30',
    declined: 'bg-rose-500/20 text-rose-600 border-rose-500/30',
    cancelled: 'bg-muted text-muted-foreground border-border',
    completed: 'bg-sky-500/20 text-sky-600 border-sky-500/30',
  };
  return (
    <Badge className={`${map[status] || 'bg-muted text-muted-foreground border-border'} whitespace-nowrap capitalize`}>
      {status.replace('_', ' ')}
    </Badge>
  );
};

const stripeStatusBadge = (agency: Agency) => {
  if (agency.stripe_payouts_enabled && agency.stripe_charges_enabled) {
    return <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/30">Connected</Badge>;
  }
  if (agency.stripe_connect_account_id || agency.stripe_connect_status) {
    return <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30">Pending</Badge>;
  }
  return <Badge className="bg-muted text-muted-foreground border-border">Not connected</Badge>;
};

const AdminAgencyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { isAdmin, loading: adminLoading } = useAdmin();
  useIdleSignOut();

  const [agency, setAgency] = useState<Agency | null>(null);
  const [owner, setOwner] = useState<OwnerProfile | null>(null);
  const [vehicleCount, setVehicleCount] = useState<number>(0);
  const [vehicles, setVehicles] = useState<VehicleRow[]>([]);
  const [updatingVehicleId, setUpdatingVehicleId] = useState<string | null>(null);
  const [feeSettings, setFeeSettings] = useState<PaymentSettings>(emptyPaymentSettings());
  const [showFeeValidation, setShowFeeValidation] = useState(false);
  const [savingFees, setSavingFees] = useState(false);
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [notes, setNotes] = useState<NoteRow[]>([]);
  const [newNote, setNewNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { user } = useAuth();
  const [sendingReset, setSendingReset] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const loadAll = async () => {
    if (!id) return;
    setLoading(true);

    const [agencyRes, bookingsRes, notesRes] = await Promise.all([
      supabase.from('agencies').select('*').eq('id', id).maybeSingle(),
      supabase
        .from('bookings')
        .select('id,pickup_date,dropoff_date,rental_days,total_amount_cents,platform_fee_cents,booking_status,payment_status,renter_name,created_at,stripe_payment_intent_id,vehicle:vehicles(make,model,year)')
        .eq('agency_id', id)
        .order('created_at', { ascending: false }),
      supabase
        .from('agency_notes')
        .select('id,note_text,admin_email,created_at')
        .eq('agency_id', id)
        .order('created_at', { ascending: false }),
    ]);

    if (agencyRes.error) {
      toast({ title: 'Error loading agency', description: agencyRes.error.message, variant: 'destructive' });
    } else {
      setAgency(agencyRes.data as unknown as Agency);
      const a = agencyRes.data as any;
      const apm = a?.payment_methods;
      const methodsArr = Array.isArray(apm)
        ? apm
        : apm && typeof apm === 'object' && Array.isArray(apm.methods)
        ? apm.methods
        : [];
      const otherText =
        apm && typeof apm === 'object' && !Array.isArray(apm) && typeof apm.other_text === 'string'
          ? apm.other_text
          : '';
      setFeeSettings(
        normalizePaymentSettings({
          payment_methods: methodsArr,
          other_payment_text: otherText,
          payment_restrictions: a?.payment_restrictions,
          tax_rate: typeof a?.tax_rate === 'string' ? Number(a.tax_rate) : a?.tax_rate,
          fees: a?.fee_settings,
          custom_fees: a?.custom_fees,
        }),
      );
      const ownerId = (agencyRes.data as any)?.owner_user_id as string | null;
      if (ownerId) {
        const { data: prof } = await supabase
          .from('profiles')
          .select('id,business_name,contact_email,contact_phone')
          .eq('user_id', ownerId)
          .maybeSingle();
        setOwner((prof as OwnerProfile) || null);
        if (prof?.id) {
          const { data: vehicleData, count } = await supabase
            .from('vehicles')
            .select('id,make,model,year,status,location_city,location_state', { count: 'exact' })
            .eq('profile_id', prof.id);
          setVehicleCount(count || 0);
          setVehicles((vehicleData as unknown as VehicleRow[]) || []);
        } else {
          setVehicleCount(0);
          setVehicles([]);
        }
      } else {
        setOwner(null);
        setVehicleCount(0);
        setVehicles([]);
      }
    }

    setBookings((bookingsRes.data as unknown as BookingRow[]) || []);
    setNotes((notesRes.data as NoteRow[]) || []);
    setLoading(false);
  };

  const saveFeeSettings = async () => {
    if (!agency) return;
    setShowFeeValidation(true);
    const errs = validatePaymentSettings(feeSettings);
    if (errs.length > 0) {
      toast({ title: 'Please fix the errors', description: errs[0], variant: 'destructive' });
      return;
    }
    setSavingFees(true);
    const { error } = await supabase
      .from('agencies')
      .update({
        payment_methods: toDbPaymentMethods(feeSettings) as any,
        payment_restrictions: feeSettings.payment_restrictions.trim() || null,
        fee_settings: feeSettings.fees as any,
        tax_rate: feeSettings.tax_rate,
        custom_fees: feeSettings.custom_fees as any,
        fees_setup_complete: true,
      })
      .eq('id', agency.id);
    setSavingFees(false);
    if (error) {
      toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
      return;
    }
    toast({
      title: 'Fees saved',
      description: `Updated payment & fee defaults for ${agency.agency_name}.`,
    });
  };

  useEffect(() => {
    if (agency) {
      pushRecentAgency({
        id: agency.id,
        agency_name: agency.agency_name,
        city: agency.city,
        state: agency.state,
      });
    }
  }, [agency]);

  useEffect(() => {
    if (!isAdmin) return;
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, id]);

  const addNote = async () => {
    if (!newNote.trim() || !user || !id) return;
    setSavingNote(true);
    const { error } = await supabase.from('agency_notes').insert({
      agency_id: id,
      admin_user_id: user.id,
      admin_email: user.email || 'unknown',
      note_text: newNote.trim(),
    });
    if (error) {
      toast({ title: 'Error saving note', description: error.message, variant: 'destructive' });
    } else {
      setNewNote('');
      toast({ title: 'Internal note saved' });
      const { data } = await supabase
        .from('agency_notes')
        .select('id,note_text,admin_email,created_at')
        .eq('agency_id', id)
        .order('created_at', { ascending: false });
      setNotes((data as NoteRow[]) || []);
    }
    setSavingNote(false);
  };

  const sendPasswordReset = async () => {
    const email = agency?.email || owner?.contact_email;
    if (!email) {
      toast({ title: 'No email on file', description: 'This agency has no contact email to send a reset link to.', variant: 'destructive' });
      return;
    }
    setSendingReset(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setSendingReset(false);
    if (error) {
      toast({ title: 'Reset email failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Password reset sent', description: `A reset link has been emailed to ${email}.` });
    }
  };

  const approveBooking = async (b: BookingRow) => {
    if (b.booking_status !== 'pending_agency') return;
    if (!b.stripe_payment_intent_id) {
      toast({
        title: 'Cannot approve yet',
        description: 'The renter\u2019s card has not been authorized yet. Card authorization happens 7 days before pickup for advance bookings.',
        variant: 'destructive',
      });
      return;
    }
    setApprovingId(b.id);
    const { data, error } = await supabase.functions.invoke('capture-booking-payment', {
      body: { booking_id: b.id },
    });
    setApprovingId(null);
    if (error || (data as any)?.error) {
      toast({
        title: 'Approval failed',
        description: (error as Error)?.message || (data as any)?.error || 'Unknown error',
        variant: 'destructive',
      });
      return;
    }
    toast({
      title: 'Booking approved',
      description: 'Payment captured. Funds will land in the agency\u2019s Stripe balance and pay out in ~2 business days.',
    });
    loadAll();
  };

  const updateVehicleStatus = async (vehicleId: string, newStatus: string) => {
    setUpdatingVehicleId(vehicleId);
    const { error } = await supabase
      .from('vehicles')
      .update({ status: newStatus as any })
      .eq('id', vehicleId);
    setUpdatingVehicleId(null);
    if (error) {
      toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
      return;
    }
    setVehicles((prev) => prev.map((v) => (v.id === vehicleId ? { ...v, status: newStatus } : v)));
    toast({
      title: 'Vehicle updated',
      description: `Status changed to ${newStatus.replace('_', ' ')} on behalf of the agency.`,
    });
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (statusFilter !== 'all' && b.booking_status !== statusFilter) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      const veh = b.vehicle ? `${b.vehicle.year || ''} ${b.vehicle.make || ''} ${b.vehicle.model || ''}`.toLowerCase() : '';
      return veh.includes(q) || b.renter_name.toLowerCase().includes(q);
    });
  }, [bookings, statusFilter, search]);

  const uniqueStatuses = useMemo(
    () => Array.from(new Set(bookings.map((b) => b.booking_status))).sort(),
    [bookings],
  );

  const totals = useMemo(() => {
    const captured = bookings.filter((b) => b.payment_status === 'succeeded');
    const totalValueCents = bookings.reduce((s, b) => s + (b.total_amount_cents || 0), 0);
    const platformFeeCents = bookings.reduce((s, b) => s + (b.platform_fee_cents || 0), 0);
    const capturedValueCents = captured.reduce((s, b) => s + (b.total_amount_cents || 0), 0);
    return { totalValueCents, platformFeeCents, capturedValueCents, capturedCount: captured.length };
  }, [bookings]);

  if (adminLoading || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Verifying admin access…</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Link
          to="/admin/agencies"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Agencies
        </Link>

        <AgencySearchBar />

        {loading || !agency ? (
          <div className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <div className="grid md:grid-cols-3 gap-4">
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
            </div>
            <Skeleton className="h-96 w-full" />
          </div>
        ) : (
          <>
            <header className="mb-6">
              <h1 className="text-3xl font-bold text-foreground">{agency.agency_name}</h1>
              <p className="text-muted-foreground mt-1">
                {[agency.city, agency.state].filter(Boolean).join(', ') || 'Location not set'}
              </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Agency Details */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5" /> Agency Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Owner</div>
                      <div className="font-medium text-foreground">
                        {owner?.business_name || 'Unassigned'}
                      </div>
                      {owner?.contact_email && (
                        <div className="text-xs text-muted-foreground">{owner.contact_email}</div>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2 h-7 text-xs"
                        onClick={sendPasswordReset}
                        disabled={sendingReset || !(agency.email || owner?.contact_email)}
                      >
                        {sendingReset ? (
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        ) : (
                          <KeyRound className="h-3 w-3 mr-1" />
                        )}
                        Send password reset
                      </Button>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Subscription</div>
                      <div className="mt-1">{subStatusBadge(agency.subscription_status)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Vehicles</div>
                      <div className="font-medium text-foreground flex items-center gap-2">
                        <Car className="h-4 w-4" /> {vehicleCount}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Contact</div>
                      <div className="font-medium text-foreground">{agency.email || '—'}</div>
                      {agency.phone && (
                        <div className="text-xs text-muted-foreground">{agency.phone}</div>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-border pt-4">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                      Internal Notes
                      <span className="text-xs text-muted-foreground font-normal">
                        (Admin-only · never shown to agency)
                      </span>
                    </label>
                    <Textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Add a confidential note about this agency…"
                      className="mt-2 min-h-[80px]"
                    />
                    <div className="flex justify-end mt-2">
                      <Button size="sm" onClick={addNote} disabled={savingNote || !newNote.trim()}>
                        <Save className="h-4 w-4 mr-1" />
                        {savingNote ? 'Saving…' : 'Save Note'}
                      </Button>
                    </div>
                    <div className="mt-4 space-y-2">
                      {notes.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No internal notes yet.</p>
                      ) : (
                        notes.map((n) => (
                          <div key={n.id} className="rounded-md border border-border p-3 bg-muted/40">
                            <p className="text-sm text-foreground whitespace-pre-wrap">{n.note_text}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {n.admin_email} · {format(new Date(n.created_at), 'PPp')}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stripe Payout Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CreditCard className="h-5 w-5" /> Stripe Payouts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Status</span>
                    {stripeStatusBadge(agency)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Last payout</span>
                    <span className="font-medium text-foreground">
                      {agency.last_payout_at
                        ? format(new Date(agency.last_payout_at), 'PP')
                        : '—'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Last amount</span>
                    <span className="font-medium text-foreground">
                      {agency.last_payout_amount_cents != null
                        ? fmtMoney(agency.last_payout_amount_cents)
                        : '—'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total captured</span>
                    <span className="font-medium text-foreground">
                      {fmtMoney(totals.capturedValueCents)}
                    </span>
                  </div>
                  {agency.last_payout_failure_message && (
                    <p className="text-xs text-rose-500 mt-2">
                      {agency.last_payout_failure_message}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Revenue Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                    <DollarSign className="h-4 w-4" /> Total Booking Value
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-foreground">{fmtMoney(totals.totalValueCents)}</p>
                  <p className="text-xs text-muted-foreground mt-1">{bookings.length} bookings</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground font-medium">
                    Platform Fees Collected
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-foreground">{fmtMoney(totals.platformFeeCents)}</p>
                  <p className="text-xs text-muted-foreground mt-1">5% Zuvio cut</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground font-medium">
                    Captured Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-foreground">{fmtMoney(totals.capturedValueCents)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {totals.capturedCount} payment{totals.capturedCount === 1 ? '' : 's'} succeeded
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Payment & Fees (admin override) */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5" /> Payment & Fees
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  Set or fix the agency-wide deposit, smoking fee, and other fee defaults on behalf of this agency.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <PaymentSettingsForm
                  value={feeSettings}
                  onChange={setFeeSettings}
                  showValidation={showFeeValidation}
                />
                <div className="flex justify-end">
                  <Button onClick={saveFeeSettings} disabled={savingFees}>
                    {savingFees ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save fees on behalf of agency
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Vehicles Management */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Car className="h-5 w-5" /> Vehicles
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  Override vehicle availability on behalf of this agency. Changes take effect immediately.
                </p>
              </CardHeader>
              <CardContent>
                {vehicles.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No vehicles found for this agency.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Vehicle</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Current status</TableHead>
                          <TableHead className="text-right">Set status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {vehicles.map((v) => (
                          <TableRow key={v.id}>
                            <TableCell className="font-medium">
                              {`${v.year || ''} ${v.make || ''} ${v.model || ''}`.trim() || '—'}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {[v.location_city, v.location_state].filter(Boolean).join(', ') || '—'}
                            </TableCell>
                            <TableCell>{vehicleStatusBadge(v.status)}</TableCell>
                            <TableCell className="text-right">
                              <Select
                                value={v.status}
                                onValueChange={(val) => updateVehicleStatus(v.id, val)}
                                disabled={updatingVehicleId === v.id}
                              >
                                <SelectTrigger className="w-[180px] ml-auto">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {vehicleStatuses.map((s) => (
                                    <SelectItem key={s} value={s} className="capitalize">
                                      {s.replace('_', ' ')}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Bookings Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Bookings</CardTitle>
                <div className="flex flex-col sm:flex-row gap-3 mt-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search by vehicle or renter…"
                      className="pl-9"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      {uniqueStatuses.map((s) => (
                        <SelectItem key={s} value={s} className="capitalize">
                          {s.replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {filteredBookings.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    {bookings.length === 0
                      ? 'No active bookings found for this agency.'
                      : 'No bookings match the current filters.'}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Vehicle</TableHead>
                          <TableHead>Renter</TableHead>
                          <TableHead>Dates</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                          <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredBookings.map((b) => (
                          <TableRow key={b.id}>
                            <TableCell className="font-medium">
                              {b.vehicle
                                ? `${b.vehicle.year || ''} ${b.vehicle.make || ''} ${b.vehicle.model || ''}`.trim()
                                : '—'}
                            </TableCell>
                            <TableCell>{b.renter_name}</TableCell>
                            <TableCell className="whitespace-nowrap text-sm">
                              {format(new Date(b.pickup_date), 'MMM d')} →{' '}
                              {format(new Date(b.dropoff_date), 'MMM d, yyyy')}
                              <div className="text-xs text-muted-foreground">{b.rental_days}d</div>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {fmtMoney(b.total_amount_cents)}
                            </TableCell>
                            <TableCell>{bookingStatusBadge(b.booking_status)}</TableCell>
                          <TableCell className="text-right">
                            {b.booking_status === 'pending_agency' ? (
                              <Button
                                size="sm"
                                variant={b.stripe_payment_intent_id ? 'default' : 'outline'}
                                onClick={() => approveBooking(b)}
                                disabled={approvingId === b.id}
                                title={
                                  b.stripe_payment_intent_id
                                    ? 'Capture the renter\u2019s authorized payment and release this booking for payout.'
                                    : 'Card not yet authorized \u2014 authorization runs 7 days before pickup.'
                                }
                              >
                                {approvingId === b.id ? (
                                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                )}
                                {b.stripe_payment_intent_id ? 'Approve & capture' : 'Awaiting auth'}
                              </Button>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </main>
  );
};

export default AdminAgencyDetail;