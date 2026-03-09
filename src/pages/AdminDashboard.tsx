import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Building2, CheckCircle, Clock, XCircle, ArrowRight, KeyRound, MapPin, Car, Crown } from 'lucide-react';
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
  owner_user_id: string | null;
  is_founding_member: boolean;
  founding_member_number: number | null;
  subscription_status: string;
  trial_end_date: string | null;
}

interface KPIs {
  total: number;
  pending: number;
  activeApproved: number;
  inactive: number;
  totalVehicles: number;
  foundingMembers: number;
  activeTrial: number;
}

const AdminDashboard = () => {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [kpis, setKPIs] = useState<KPIs>({ total: 0, pending: 0, activeApproved: 0, inactive: 0, totalVehicles: 0, foundingMembers: 0, activeTrial: 0 });
  const [loading, setLoading] = useState(true);

  // City breakdown
  const cityBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    agencies.forEach((a) => {
      const city = a.city || 'Unknown';
      map[city] = (map[city] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [agencies]);

  const citiesWithActiveAgencies = useMemo(() => {
    const set = new Set<string>();
    agencies.forEach((a) => {
      if (a.approved && a.active && a.city) set.add(a.city);
    });
    return set.size;
  }, [agencies]);

  const fetchData = async () => {
    const { data, error } = await supabase
      .from('agencies')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error loading agencies', description: error.message, variant: 'destructive' });
      return;
    }

    const all = (data || []) as Agency[];
    setAgencies(all);
    
    // Fetch total vehicle count from approved agencies
    let totalVehicles = 0;
    const approvedOwnerIds = all
      .filter(a => a.approved && a.active && a.owner_user_id)
      .map(a => a.owner_user_id) as string[];
    
    if (approvedOwnerIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id')
        .in('user_id', approvedOwnerIds);
      
      if (profiles && profiles.length > 0) {
        const profileIds = profiles.map(p => p.id);
        const { count } = await supabase
          .from('vehicles')
          .select('*', { count: 'exact', head: true })
          .in('profile_id', profileIds);
        
        totalVehicles = count || 0;
      }
    }
    
    setKPIs({
      total: all.length,
      pending: all.filter((a) => !a.approved).length,
      activeApproved: all.filter((a) => a.approved && a.active).length,
      inactive: all.filter((a) => !a.active).length,
      totalVehicles,
      foundingMembers: all.filter((a) => a.is_founding_member).length,
      activeTrial: all.filter((a) => a.subscription_status === 'trial').length,
    });
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) fetchData();
  }, [isAdmin]);

  const handleApprove = async (id: string) => {
    const agency = agencies.find(a => a.id === id);
    
    const { error } = await supabase
      .from('agencies')
      .update({ approved: true })
      .eq('id', id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Agency approved' });
    
    // Send approval email
    if (agency?.email) {
      try {
        await supabase.functions.invoke('send-agency-approval', {
          body: {
            agency: {
              agency_name: agency.agency_name,
              email: agency.email,
            },
          },
        });
        toast({ title: 'Approval email sent', description: `Email sent to ${agency.email}` });
      } catch (emailErr) {
        console.error('Approval email failed:', emailErr);
      }
    }
    
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
    { label: 'Founding Members', value: `${kpis.foundingMembers}/50`, icon: Crown, color: 'text-amber-500' },
    { label: 'Active Trials', value: kpis.activeTrial, icon: Clock, color: 'text-primary' },
    { label: 'Total Vehicles', value: kpis.totalVehicles, icon: Car, color: 'text-primary' },
    { label: 'Cities w/ Agencies', value: citiesWithActiveAgencies, icon: MapPin, color: 'text-primary' },
    { label: 'Inactive', value: kpis.inactive, icon: XCircle, color: 'text-destructive' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Platform Administration</h1>
            <p className="text-sm text-muted-foreground">Zuvio Admin Dashboard</p>
          </div>
          <div className="flex gap-2">
            <Link to="/admin/invite-codes">
              <Button variant="outline" size="sm">
                <KeyRound className="mr-2 h-4 w-4" /> Manage Invite Codes
              </Button>
            </Link>
            <Link to="/admin/agencies">
              <Button variant="outline" size="sm">
                Manage Agencies <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/">
              <Button variant="ghost" size="sm">Back to Site</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4">
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

        {/* City Breakdown */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" /> Agencies by City
          </h2>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : cityBreakdown.length === 0 ? (
            <p className="text-muted-foreground">No agencies yet.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {cityBreakdown.map(([city, count]) => (
                <Card key={city} className="p-3">
                  <p className="font-medium text-sm truncate">{city}</p>
                  <p className="text-2xl font-bold text-primary">{count}</p>
                </Card>
              ))}
            </div>
          )}
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
