import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Download, Search, Users, UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/hooks/useAdmin';
import { useIdleSignOut } from '@/hooks/useIdleSignOut';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';

type Renter = {
  key: string;
  source: string;
  name: string;
  phone: string;
  email: string;
  agency: string;
  vehicle: string;
  pickup: string | null;
  dropoff: string | null;
  status: string;
  total: number | null;
  createdAt: string;
};

const fmt = (d: string | null) => (d ? new Date(`${d}T00:00:00`).toLocaleDateString() : '—');

const toCsv = (rows: Renter[], includeTotal: boolean) => {
  const head = ['Name', 'Phone', 'Email', 'Agency', 'Vehicle', 'Pickup date', 'Return date', 'Status', 'Source', ...(includeTotal ? ['Total (USD)'] : [])];
  const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const body = rows.map((r) =>
    [r.name, r.phone, r.email, r.agency, r.vehicle, r.pickup ?? '', r.dropoff ?? '', r.status, r.source, ...(includeTotal ? [r.total ?? ''] : [])]
      .map(esc)
      .join(','),
  );
  return [head.map(esc).join(','), ...body].join('\n');
};

const download = (rows: Renter[], filename: string, includeTotal: boolean) => {
  const blob = new Blob([toCsv(rows, includeTotal)], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const AdminRenters = () => {
  const { isAdmin, loading: adminLoading } = useAdmin();
  useIdleSignOut();
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<Renter[]>([]);
  const [leads, setLeads] = useState<Renter[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!isAdmin) return;
    const load = async () => {
      const [bookingsRes, inquiriesRes, requestsRes, reservationsRes, agenciesRes, vehiclesRes] = await Promise.all([
        supabase.from('bookings').select('id, renter_name, renter_phone, renter_email, agency_id, vehicle_id, pickup_date, dropoff_date, booking_status, payment_status, total_amount_cents, created_at'),
        supabase.from('vehicle_inquiries').select('id, renter_name, renter_phone, renter_email, agency_id, vehicle_id, pickup_date, dropoff_date, status, created_at'),
        supabase.from('reservation_requests').select('id, customer_name, customer_phone, customer_email, agency_name, vehicle_type, pickup_date, dropoff_date, status, created_at'),
        supabase.from('reservations').select('id, full_name, phone_number, email, agency_id, vehicle_type, pickup_date, dropoff_date, status, created_at'),
        supabase.from('agencies').select('id, agency_name'),
        supabase.from('vehicles').select('id, year, make, model'),
      ]);

      const firstError = [bookingsRes, inquiriesRes, requestsRes, reservationsRes].find((r) => r.error)?.error;
      if (firstError) {
        toast({ title: 'Could not load renters', description: firstError.message, variant: 'destructive' });
        setLoading(false);
        return;
      }

      const agencyName = new Map((agenciesRes.data ?? []).map((a) => [a.id, a.agency_name]));
      const vehicleName = new Map(
        (vehiclesRes.data ?? []).map((v) => [v.id, [v.year, v.make, v.model].filter(Boolean).join(' ')]),
      );

      const paid: Renter[] = [];
      const other: Renter[] = [];

      for (const b of bookingsRes.data ?? []) {
        const row: Renter = {
          key: `b-${b.id}`,
          source: 'Booking',
          name: b.renter_name,
          phone: b.renter_phone ?? '',
          email: b.renter_email ?? '',
          agency: agencyName.get(b.agency_id ?? '') ?? '—',
          vehicle: vehicleName.get(b.vehicle_id ?? '') ?? '—',
          pickup: b.pickup_date,
          dropoff: b.dropoff_date,
          status: `${b.booking_status} / ${b.payment_status}`,
          total: b.total_amount_cents != null ? b.total_amount_cents / 100 : null,
          createdAt: b.created_at,
        };
        if (b.payment_status === 'captured') paid.push(row);
        else other.push(row);
      }

      for (const i of inquiriesRes.data ?? []) {
        other.push({
          key: `i-${i.id}`,
          source: 'Inquiry',
          name: i.renter_name,
          phone: i.renter_phone ?? '',
          email: i.renter_email ?? '',
          agency: agencyName.get(i.agency_id ?? '') ?? '—',
          vehicle: vehicleName.get(i.vehicle_id ?? '') ?? '—',
          pickup: i.pickup_date,
          dropoff: i.dropoff_date,
          status: i.status ?? 'inquiry',
          total: null,
          createdAt: i.created_at,
        });
      }

      for (const r of requestsRes.data ?? []) {
        other.push({
          key: `r-${r.id}`,
          source: 'Request',
          name: r.customer_name,
          phone: r.customer_phone ?? '',
          email: r.customer_email ?? '',
          agency: r.agency_name ?? '—',
          vehicle: r.vehicle_type ?? '—',
          pickup: r.pickup_date,
          dropoff: r.dropoff_date,
          status: r.status ?? 'request',
          total: null,
          createdAt: r.created_at,
        });
      }

      for (const s of reservationsRes.data ?? []) {
        other.push({
          key: `s-${s.id}`,
          source: 'Reservation',
          name: s.full_name,
          phone: s.phone_number ?? '',
          email: s.email ?? '',
          agency: agencyName.get(s.agency_id ?? '') ?? '—',
          vehicle: s.vehicle_type ?? '—',
          pickup: s.pickup_date,
          dropoff: s.dropoff_date,
          status: s.status ?? 'reservation',
          total: null,
          createdAt: s.created_at,
        });
      }

      const byNewest = (a: Renter, b: Renter) => b.createdAt.localeCompare(a.createdAt);
      setCustomers(paid.sort((a, b) => (b.dropoff ?? '').localeCompare(a.dropoff ?? '')));
      setLeads(other.sort(byNewest));
      setLoading(false);
    };
    load();
  }, [isAdmin]);

  const filter = (rows: Renter[]) => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.name, r.phone, r.email, r.agency, r.vehicle, r.status].some((v) => (v ?? '').toLowerCase().includes(q)),
    );
  };

  const visibleCustomers = useMemo(() => filter(customers), [customers, search]);
  const visibleLeads = useMemo(() => filter(leads), [leads, search]);
  const today = new Date().toISOString().slice(0, 10);

  if (adminLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading renters…</div>
      </div>
    );
  }

  const renderTable = (rows: Renter[], showTotals: boolean) => (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Renter</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Agency</TableHead>
            <TableHead>Vehicle</TableHead>
            <TableHead>Pickup</TableHead>
            <TableHead>Return</TableHead>
            {showTotals && <TableHead>Total</TableHead>}
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={showTotals ? 9 : 8} className="text-center text-muted-foreground py-8">
                No renters match this view.
              </TableCell>
            </TableRow>
          )}
          {rows.map((r) => (
            <TableRow key={r.key}>
              <TableCell className="font-medium whitespace-nowrap">{r.name}</TableCell>
              <TableCell className="whitespace-nowrap">
                {r.phone ? <a href={`tel:${r.phone}`} className="underline underline-offset-2">{r.phone}</a> : '—'}
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {r.email ? <a href={`mailto:${r.email}`} className="underline underline-offset-2">{r.email}</a> : '—'}
              </TableCell>
              <TableCell className="whitespace-nowrap">{r.agency}</TableCell>
              <TableCell className="whitespace-nowrap">{r.vehicle}</TableCell>
              <TableCell className="whitespace-nowrap">{fmt(r.pickup)}</TableCell>
              <TableCell className="whitespace-nowrap">
                {fmt(r.dropoff)}
                {showTotals && r.dropoff && r.dropoff < today && (
                  <Badge variant="secondary" className="ml-2">Returned</Badge>
                )}
              </TableCell>
              {showTotals && <TableCell className="whitespace-nowrap">{r.total != null ? `$${r.total.toFixed(2)}` : '—'}</TableCell>}
              <TableCell className="whitespace-nowrap text-muted-foreground">{r.source} · {r.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Link to="/admin" className="shrink-0">
            <Button variant="ghost" size="icon" aria-label="Back to admin dashboard"><ArrowLeft className="h-5 w-5" /></Button>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold truncate">Renter Directory</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 sm:py-8 space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" /> Paid customers
              </CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold">{customers.length}</CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                <UserPlus className="h-4 w-4" /> Leads &amp; incomplete
              </CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold">{leads.length}</CardContent>
          </Card>
        </div>

        <div className="relative sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search name, phone, email, agency, vehicle…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search renters"
          />
        </div>

        <Tabs defaultValue="customers">
          <TabsList>
            <TabsTrigger value="customers">Paid customers ({visibleCustomers.length})</TabsTrigger>
            <TabsTrigger value="leads">Leads &amp; incomplete ({visibleLeads.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="customers" className="space-y-3">
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={() => download(visibleCustomers, 'zuvio-paid-customers.csv', true)}>
                <Download className="h-4 w-4 mr-2" /> Export CSV
              </Button>
            </div>
            {renderTable(visibleCustomers, true)}
          </TabsContent>

          <TabsContent value="leads" className="space-y-3">
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={() => download(visibleLeads, 'zuvio-leads.csv', false)}>
                <Download className="h-4 w-4 mr-2" /> Export CSV
              </Button>
            </div>
            {renderTable(visibleLeads, false)}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminRenters;
