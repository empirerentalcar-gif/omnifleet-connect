import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, Pencil, Save, X, ChevronLeft, ChevronRight, ArrowUp, ArrowDown, ArrowUpDown, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Agency {
  id: string;
  agency_name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  approved: boolean;
  active: boolean;
  created_at: string;
  owner_user_id: string | null;
}

type SortKey = 'agency_name' | 'city' | 'approved' | 'active' | 'created_at';
type SortDir = 'asc' | 'desc';

const AdminAgencies = () => {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Agency>>({});
  const [deactivateTarget, setDeactivateTarget] = useState<Agency | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const fetchAgencies = async () => {
    const { data, error } = await supabase
      .from('agencies')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    setAgencies(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) fetchAgencies();
  }, [isAdmin]);

  const handleToggle = async (agency: Agency, field: 'approved' | 'active', value: boolean) => {
    if (field === 'active' && !value) {
      setDeactivateTarget(agency);
      return;
    }
    await performToggle(agency.id, field, value);
  };

  const performToggle = async (id: string, field: string, value: boolean) => {
    const { error } = await supabase
      .from('agencies')
      .update({ [field]: value })
      .eq('id', id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: `Agency ${field} updated` });
    fetchAgencies();
  };

  const confirmDeactivate = async () => {
    if (!deactivateTarget) return;
    await performToggle(deactivateTarget.id, 'active', false);
    setDeactivateTarget(null);
  };

  const startEdit = (agency: Agency) => {
    setEditingId(agency.id);
    setEditData({
      agency_name: agency.agency_name,
      phone: agency.phone,
      email: agency.email,
      address: agency.address,
      city: agency.city,
      state: agency.state,
      zip: agency.zip,
    });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const { error } = await supabase
      .from('agencies')
      .update(editData)
      .eq('id', editingId);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Agency updated' });
    setEditingId(null);
    fetchAgencies();
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return <ArrowUpDown className="h-3 w-3 ml-1 opacity-40" />;
    return sortDir === 'asc' ? <ArrowUp className="h-3 w-3 ml-1" /> : <ArrowDown className="h-3 w-3 ml-1" />;
  };

  const filtered = agencies.filter((a) => {
    const q = search.toLowerCase();
    return (
      a.agency_name.toLowerCase().includes(q) ||
      (a.city && a.city.toLowerCase().includes(q))
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    switch (sortKey) {
      case 'agency_name': return dir * a.agency_name.localeCompare(b.agency_name);
      case 'city': return dir * (a.city || '').localeCompare(b.city || '');
      case 'approved': return dir * (Number(a.approved) - Number(b.approved));
      case 'active': return dir * (Number(a.active) - Number(b.active));
      case 'created_at': return dir * (new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      default: return 0;
    }
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [search]);

  const exportCSV = () => {
    const headers = ['Agency Name', 'City', 'State', 'Phone', 'Email', 'Approved', 'Active', 'Created At', 'Owner User ID'];
    const rows = sorted.map(a => [
      a.agency_name,
      a.city || '',
      a.state || '',
      a.phone || '',
      a.email || '',
      String(a.approved),
      String(a.active),
      format(new Date(a.created_at), 'yyyy-MM-dd'),
      a.owner_user_id || '',
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agencies_export_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/admin">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
          </Link>
          <h1 className="text-2xl font-bold">Agencies Management</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" onClick={exportCSV}>
            <Download className="h-4 w-4 mr-2" /> Export CSV
          </Button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : (
          <>
          <div className="rounded-lg border overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('agency_name')}>
                    <span className="inline-flex items-center">Agency Name <SortIcon column="agency_name" /></span>
                  </TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('city')}>
                    <span className="inline-flex items-center">City <SortIcon column="city" /></span>
                  </TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('approved')}>
                    <span className="inline-flex items-center">Approved <SortIcon column="approved" /></span>
                  </TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('active')}>
                    <span className="inline-flex items-center">Active <SortIcon column="active" /></span>
                  </TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('created_at')}>
                    <span className="inline-flex items-center">Created <SortIcon column="created_at" /></span>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No agencies found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((agency) => (
                    <TableRow key={agency.id}>
                      <TableCell className="font-medium">
                        {editingId === agency.id ? (
                          <Input
                            value={editData.agency_name || ''}
                            onChange={(e) => setEditData({ ...editData, agency_name: e.target.value })}
                            className="h-8 w-40"
                          />
                        ) : (
                          agency.agency_name
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === agency.id ? (
                          <Input
                            value={editData.city || ''}
                            onChange={(e) => setEditData({ ...editData, city: e.target.value })}
                            className="h-8 w-28"
                          />
                        ) : (
                          agency.city || '—'
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === agency.id ? (
                          <Input
                            value={editData.state || ''}
                            onChange={(e) => setEditData({ ...editData, state: e.target.value })}
                            className="h-8 w-20"
                          />
                        ) : (
                          agency.state || '—'
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === agency.id ? (
                          <Input
                            value={editData.phone || ''}
                            onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                            className="h-8 w-32"
                          />
                        ) : (
                          agency.phone || '—'
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === agency.id ? (
                          <Input
                            value={editData.email || ''}
                            onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                            className="h-8 w-40"
                          />
                        ) : (
                          agency.email || '—'
                        )}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={agency.approved}
                          onCheckedChange={(v) => handleToggle(agency, 'approved', v)}
                        />
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={agency.active}
                          onCheckedChange={(v) => handleToggle(agency, 'active', v)}
                        />
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(agency.created_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="text-right">
                        {editingId === agency.id ? (
                          <div className="flex gap-1 justify-end">
                            <Button size="icon" variant="ghost" onClick={saveEdit}>
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => setEditingId(null)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button size="icon" variant="ghost" onClick={() => startEdit(agency)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {sorted.length > PAGE_SIZE && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, sorted.length)} of {sorted.length}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
          </>
        )}
      </main>

      <AlertDialog open={!!deactivateTarget} onOpenChange={() => setDeactivateTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Agency?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to deactivate <strong>{deactivateTarget?.agency_name}</strong>? This agency will no longer be visible to users.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeactivate}>Deactivate</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminAgencies;
