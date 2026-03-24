import { useEffect, useState } from 'react';
import { CalendarDays, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Reservation {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  agency_name: string;
  vehicle_type: string;
  pickup_date: string;
  dropoff_date: string;
  status: string;
  created_at: string;
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  approved: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  declined: 'bg-destructive/20 text-destructive border-destructive/30',
  vehicle_ready: 'bg-primary/20 text-primary border-primary/30',
  extension_approved: 'bg-primary/20 text-primary border-primary/30',
};

type SortDir = 'asc' | 'desc';

const AdminReservations = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const fetchReservations = async () => {
    setLoading(true);
    let query = supabase
      .from('reservation_requests')
      .select('*')
      .order('created_at', { ascending: sortDir === 'asc' });

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    const { data, error } = await query;

    if (error) {
      toast({ title: 'Error loading reservations', description: error.message, variant: 'destructive' });
      setLoading(false);
      return;
    }

    setReservations((data || []) as Reservation[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchReservations();
  }, [statusFilter, sortDir]);

  const statuses = ['all', 'pending', 'approved', 'declined', 'vehicle_ready', 'extension_approved'];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <CalendarDays className="h-5 w-5 text-primary" /> All Reservation Requests
      </h2>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Filter className="h-4 w-4 text-muted-foreground" />
        {statuses.map((s) => (
          <Button
            key={s}
            size="sm"
            variant={statusFilter === s ? 'default' : 'outline'}
            onClick={() => setStatusFilter(s)}
            className="capitalize text-xs"
          >
            {s === 'all' ? 'All' : s.replace('_', ' ')}
          </Button>
        ))}
        <div className="ml-auto">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}
            className="text-xs"
          >
            Date: {sortDir === 'desc' ? 'Newest first' : 'Oldest first'}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : reservations.length === 0 ? (
        <p className="text-muted-foreground">No reservation requests found.</p>
      ) : (
        <div className="rounded-lg border overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Renter Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Agency</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Pickup</TableHead>
                <TableHead>Return</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservations.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.customer_name}</TableCell>
                  <TableCell>{r.customer_phone}</TableCell>
                  <TableCell>{r.customer_email || '—'}</TableCell>
                  <TableCell>{r.agency_name}</TableCell>
                  <TableCell>{r.vehicle_type}</TableCell>
                  <TableCell>{format(new Date(r.pickup_date), 'MMM d, yyyy')}</TableCell>
                  <TableCell>{format(new Date(r.dropoff_date), 'MMM d, yyyy')}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`capitalize ${statusColors[r.status] || ''}`}>
                      {r.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(r.created_at), 'MMM d, yyyy h:mm a')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <p className="text-xs text-muted-foreground mt-2">
        Showing {reservations.length} reservation{reservations.length !== 1 ? 's' : ''}
      </p>
    </div>
  );
};

export default AdminReservations;
