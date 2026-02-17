import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, CheckCircle, Clock, XCircle, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Agency {
  id: string;
  agency_name: string;
  city: string | null;
  state: string | null;
  phone: string | null;
  email: string | null;
  approved: boolean;
  active: boolean;
  created_at: string;
}

interface KPIs {
  total: number;
  pending: number;
  activeApproved: number;
  inactive: number;
}

const AdminDashboard = () => {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [kpis, setKPIs] = useState<KPIs>({ total: 0, pending: 0, activeApproved: 0, inactive: 0 });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const { data, error } = await supabase
      .from('agencies')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error loading agencies', description: error.message, variant: 'destructive' });
      return;
    }

    const all = data || [];
    setAgencies(all);
    setKPIs({
      total: all.length,
      pending: all.filter((a) => !a.approved).length,
      activeApproved: all.filter((a) => a.approved && a.active).length,
      inactive: all.filter((a) => !a.active).length,
    });
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) fetchData();
  }, [isAdmin]);

  const handleApprove = async (id: string) => {
    const { error } = await supabase
      .from('agencies')
      .update({ approved: true })
      .eq('id', id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Agency approved' });
    fetchData();
  };

  if (adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const pendingAgencies = agencies.filter((a) => !a.approved);

  const kpiCards = [
    { label: 'Total Agencies', value: kpis.total, icon: Building2, color: 'text-primary' },
    { label: 'Pending Approvals', value: kpis.pending, icon: Clock, color: 'text-amber-500' },
    { label: 'Active & Approved', value: kpis.activeApproved, icon: CheckCircle, color: 'text-emerald-500' },
    { label: 'Inactive', value: kpis.inactive, icon: XCircle, color: 'text-destructive' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">ZUVIO Admin</h1>
          <Link to="/admin/agencies">
            <Button variant="outline" size="sm">
              Manage Agencies <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiCards.map((kpi) => (
            <Card key={kpi.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.label}</CardTitle>
                <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-3xl font-bold">{kpi.value}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pending Agencies */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Pending Approvals</h2>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : pendingAgencies.length === 0 ? (
            <p className="text-muted-foreground">No pending agencies.</p>
          ) : (
            <div className="rounded-lg border overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agency Name</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>State</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingAgencies.map((agency) => (
                    <TableRow key={agency.id}>
                      <TableCell className="font-medium">{agency.agency_name}</TableCell>
                      <TableCell>{agency.city || '—'}</TableCell>
                      <TableCell>{agency.state || '—'}</TableCell>
                      <TableCell>{agency.phone || '—'}</TableCell>
                      <TableCell>{format(new Date(agency.created_at), 'MMM d, yyyy')}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" onClick={() => handleApprove(agency.id)}>
                          Approve
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
