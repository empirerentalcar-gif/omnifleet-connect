import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, Pencil, Plus, Save, X, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InviteCode {
  id: string;
  code: string;
  city: string | null;
  max_uses: number;
  uses_count: number;
  active: boolean;
  expires_at: string | null;
  created_at: string;
}

const generateCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
};

const AdminInviteCodes = () => {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [codes, setCodes] = useState<InviteCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  // Create modal
  const [createOpen, setCreateOpen] = useState(false);
  const [newCode, setNewCode] = useState({ code: '', city: '', max_uses: 25, expires_at: undefined as Date | undefined });
  const [creating, setCreating] = useState(false);

  // Edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<InviteCode | null>(null);
  const [editData, setEditData] = useState({ max_uses: 25, expires_at: undefined as Date | undefined });

  const fetchCodes = async () => {
    const { data, error } = await supabase
      .from('invite_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    setCodes(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) fetchCodes();
  }, [isAdmin]);

  const handleCreate = async () => {
    if (!newCode.code.trim()) {
      toast({ title: 'Code is required', variant: 'destructive' });
      return;
    }
    setCreating(true);
    const { error } = await supabase.from('invite_codes').insert({
      code: newCode.code.trim().toUpperCase(),
      city: newCode.city.trim() || null,
      max_uses: newCode.max_uses,
      expires_at: newCode.expires_at ? newCode.expires_at.toISOString() : null,
    });
    setCreating(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Invite code created' });
    setCreateOpen(false);
    setNewCode({ code: '', city: '', max_uses: 25, expires_at: undefined });
    fetchCodes();
  };

  const handleToggleActive = async (item: InviteCode, value: boolean) => {
    const { error } = await supabase
      .from('invite_codes')
      .update({ active: value })
      .eq('id', item.id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: `Code ${value ? 'activated' : 'disabled'}` });
    fetchCodes();
  };

  const openEdit = (item: InviteCode) => {
    setEditTarget(item);
    setEditData({
      max_uses: item.max_uses,
      expires_at: item.expires_at ? new Date(item.expires_at) : undefined,
    });
    setEditOpen(true);
  };

  const handleEditSave = async () => {
    if (!editTarget) return;
    const { error } = await supabase
      .from('invite_codes')
      .update({
        max_uses: editData.max_uses,
        expires_at: editData.expires_at ? editData.expires_at.toISOString() : null,
      })
      .eq('id', editTarget.id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Code updated' });
    setEditOpen(false);
    fetchCodes();
  };

  const filtered = codes.filter((c) => {
    const q = search.toLowerCase();
    return c.code.toLowerCase().includes(q) || (c.city && c.city.toLowerCase().includes(q));
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [search]);

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
          <h1 className="text-2xl font-bold">Invite Code Management</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by code or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={() => { setNewCode({ code: '', city: '', max_uses: 25, expires_at: undefined }); setCreateOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" /> Create New Code
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
                    <TableHead>Code</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Max Uses</TableHead>
                    <TableHead>Uses Count</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead>Expires At</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No invite codes found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginated.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono font-medium">{item.code}</TableCell>
                        <TableCell>{item.city || '—'}</TableCell>
                        <TableCell>{item.max_uses}</TableCell>
                        <TableCell>{item.uses_count}</TableCell>
                        <TableCell>
                          <Switch
                            checked={item.active}
                            onCheckedChange={(v) => handleToggleActive(item, v)}
                          />
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {item.expires_at ? format(new Date(item.expires_at), 'MMM d, yyyy') : 'Never'}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {format(new Date(item.created_at), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end">
                            <Button size="icon" variant="ghost" onClick={() => openEdit(item)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleToggleActive(item, !item.active)}
                            >
                              {item.active ? 'Disable' : 'Enable'}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {filtered.length > PAGE_SIZE && (
              <div className="flex items-center justify-between pt-4">
                <p className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => setPage((p) => p - 1)}>
                    <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                  </Button>
                  <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => setPage((p) => p + 1)}>
                    Next <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Create Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Invite Code</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Code</Label>
              <div className="flex gap-2">
                <Input
                  value={newCode.code}
                  onChange={(e) => setNewCode({ ...newCode, code: e.target.value.toUpperCase() })}
                  placeholder="Enter code"
                  className="font-mono"
                />
                <Button variant="outline" type="button" onClick={() => setNewCode({ ...newCode, code: generateCode() })}>
                  <RefreshCw className="h-4 w-4 mr-1" /> Auto
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>City (optional)</Label>
              <Input
                value={newCode.city}
                onChange={(e) => setNewCode({ ...newCode, city: e.target.value })}
                placeholder="e.g. Miami"
              />
            </div>
            <div className="space-y-2">
              <Label>Max Uses</Label>
              <Input
                type="number"
                min={1}
                value={newCode.max_uses}
                onChange={(e) => setNewCode({ ...newCode, max_uses: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div className="space-y-2">
              <Label>Expires At (optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !newCode.expires_at && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newCode.expires_at ? format(newCode.expires_at, 'PPP') : 'No expiration'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={newCode.expires_at}
                    onSelect={(d) => setNewCode({ ...newCode, expires_at: d || undefined })}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={creating}>
              {creating ? 'Creating...' : 'Create Code'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Code: {editTarget?.code}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Max Uses</Label>
              <Input
                type="number"
                min={1}
                value={editData.max_uses}
                onChange={(e) => setEditData({ ...editData, max_uses: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div className="space-y-2">
              <Label>Expires At</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !editData.expires_at && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {editData.expires_at ? format(editData.expires_at, 'PPP') : 'No expiration'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={editData.expires_at}
                    onSelect={(d) => setEditData({ ...editData, expires_at: d || undefined })}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEditSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminInviteCodes;
