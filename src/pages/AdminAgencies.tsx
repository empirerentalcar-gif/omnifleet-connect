import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  Pencil,
  Save,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Download,
  MessageSquare,
  Send,
  AlertTriangle,
  UserPlus,
  Filter,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { useAdmin } from '@/hooks/useAdmin';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { MAJOR_CITIES } from '@/lib/city-data';

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

interface AgencyNote {
  id: string;
  agency_id: string;
  admin_user_id: string;
  admin_email: string;
  note_text: string;
  created_at: string;
}

type ProfileOption = {
  user_id: string;
  business_name: string;
  contact_email: string;
};

type SortKey = 'agency_name' | 'city' | 'approved' | 'active' | 'created_at';
type SortDir = 'asc' | 'desc';

const OWNER_UNASSIGNED = '__unassigned__';

const AdminAgencies = () => {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { user } = useAuth();
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [profileOptions, setProfileOptions] = useState<ProfileOption[]>([]);
  const profilesByUserId = useMemo(() => {
    return new Map(profileOptions.map((p) => [p.user_id, p] as const));
  }, [profileOptions]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState<string>('all');

  // Compute unique cities from agencies data
  const uniqueCities = useMemo(() => {
    const cities = agencies
      .map(a => a.city)
      .filter((c): c is string => Boolean(c));
    return Array.from(new Set(cities)).sort();
  }, [agencies]);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Agency>>({});
  const [deactivateTarget, setDeactivateTarget] = useState<Agency | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  // Notes state
  const [expandedNotes, setExpandedNotes] = useState<string | null>(null);
  const [notesMap, setNotesMap] = useState<Record<string, AgencyNote[]>>({});
  const [newNoteText, setNewNoteText] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  // Assign-owner dialog state
  const [assignTarget, setAssignTarget] = useState<Agency | null>(null);
  const [assignSearch, setAssignSearch] = useState('');
  const [assignSelected, setAssignSelected] = useState<ProfileOption | null>(null);
  const [assigning, setAssigning] = useState(false);

  const assignFilteredProfiles = useMemo(() => {
    if (!assignSearch.trim()) return profileOptions.slice(0, 20);
    const q = assignSearch.toLowerCase();
    return profileOptions
      .filter(p => p.business_name.toLowerCase().includes(q) || p.contact_email.toLowerCase().includes(q))
      .slice(0, 20);
  }, [profileOptions, assignSearch]);

  const openAssignDialog = (agency: Agency) => {
    setAssignTarget(agency);
    setAssignSearch('');
    setAssignSelected(null);
  };

  const confirmAssignOwner = async () => {
    if (!assignTarget || !assignSelected) return;
    setAssigning(true);
    const { error } = await supabase.rpc('assign_agency_owner', {
      _agency_id: assignTarget.id,
      _owner_user_id: assignSelected.user_id,
    });
    if (error) {
      toast({ title: 'Error assigning owner', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Owner assigned', description: `${assignSelected.business_name} is now the owner of ${assignTarget.agency_name}.` });
      fetchAgencies();
    }
    setAssigning(false);
    setAssignTarget(null);
  };

  const confirmUnassignOwner = async () => {
    if (!assignTarget) return;
    setAssigning(true);
    const wasApproved = assignTarget.approved;

    const { error } = await supabase.rpc('assign_agency_owner', {
      _agency_id: assignTarget.id,
      _owner_user_id: null,
    });
    if (error) {
      toast({ title: 'Error removing owner', description: error.message, variant: 'destructive' });
      setAssigning(false);
      setAssignTarget(null);
      return;
    }

    // If the agency was approved, automatically unapprove it
    if (wasApproved) {
      const { error: unapproveError } = await supabase
        .from('agencies')
        .update({ approved: false })
        .eq('id', assignTarget.id);

      if (unapproveError) {
        toast({ title: 'Error unapproving agency', description: unapproveError.message, variant: 'destructive' });
      } else {
        toast({
          title: 'Owner removed — agency unapproved',
          description: `${assignTarget.agency_name} has been unapproved. Assign a new owner before re-approving so vehicles appear in search.`,
          variant: 'destructive',
        });
      }
    } else {
      toast({ title: 'Owner removed', description: `${assignTarget.agency_name} no longer has an assigned owner.` });
    }

    fetchAgencies();
    setAssigning(false);
    setAssignTarget(null);
  };

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

  const fetchProfiles = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('user_id, business_name, contact_email')
      .order('business_name', { ascending: true });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }

    setProfileOptions((data || []) as ProfileOption[]);
  };

  const fetchNotesForAgency = async (agencyId: string) => {
    const { data, error } = await supabase
      .from('agency_notes')
      .select('*')
      .eq('agency_id', agencyId)
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error loading notes', description: error.message, variant: 'destructive' });
      return;
    }
    setNotesMap(prev => ({ ...prev, [agencyId]: (data || []) as AgencyNote[] }));
  };

  const addNote = async (agencyId: string) => {
    if (!newNoteText.trim() || !user) return;
    setAddingNote(true);

    const { error } = await supabase
      .from('agency_notes')
      .insert({
        agency_id: agencyId,
        admin_user_id: user.id,
        admin_email: user.email || 'unknown',
        note_text: newNoteText.trim(),
      });

    if (error) {
      toast({ title: 'Error adding note', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Note added' });
      setNewNoteText('');
      await fetchNotesForAgency(agencyId);
    }
    setAddingNote(false);
  };

  const toggleNotes = async (agencyId: string) => {
    if (expandedNotes === agencyId) {
      setExpandedNotes(null);
      setNewNoteText('');
    } else {
      setExpandedNotes(agencyId);
      setNewNoteText('');
      if (!notesMap[agencyId]) {
        await fetchNotesForAgency(agencyId);
      }
    }
  };

  useEffect(() => {
    if (!isAdmin) return;
    fetchAgencies();
    fetchProfiles();
  }, [isAdmin]);

  const handleToggle = async (agency: Agency, field: 'approved' | 'active', value: boolean) => {
    if (field === 'approved' && value && !agency.owner_user_id) {
      toast({
        title: 'Assign an owner first',
        description: 'Set the agency owner (account) before approving so its vehicles can appear in search.',
        variant: 'destructive',
      });
      return;
    }

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
      owner_user_id: agency.owner_user_id ?? OWNER_UNASSIGNED,
    });
  };

  const saveEdit = async () => {
    if (!editingId) return;

    const payload: Record<string, unknown> = { ...editData };
    if (payload.owner_user_id === OWNER_UNASSIGNED) payload.owner_user_id = null;

    const { error } = await supabase
      .from('agencies')
      .update(payload)
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
    const matchesSearch =
      a.agency_name.toLowerCase().includes(q) ||
      (a.city && a.city.toLowerCase().includes(q));
    const matchesCity = cityFilter === 'all' || (a.city || '').toLowerCase() === cityFilter.toLowerCase();
    return matchesSearch && matchesCity;
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
                  <TableHead>Owner</TableHead>
                  <TableHead
                    className="cursor-pointer select-none"
                    onClick={() => toggleSort('approved')}
                  >
                    <span className="inline-flex items-center">
                      Approved <SortIcon column="approved" />
                    </span>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none"
                    onClick={() => toggleSort('active')}
                  >
                    <span className="inline-flex items-center">
                      Active <SortIcon column="active" />
                    </span>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none"
                    onClick={() => toggleSort('created_at')}
                  >
                    <span className="inline-flex items-center">
                      Created <SortIcon column="created_at" />
                    </span>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      No agencies found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((agency) => (
                    <Collapsible key={agency.id} open={expandedNotes === agency.id} asChild>
                      <>
                        <TableRow>
                          <TableCell className="font-medium">
                            {editingId === agency.id ? (
                              <Input
                                value={editData.agency_name || ''}
                                onChange={(e) => setEditData({ ...editData, agency_name: e.target.value })}
                                className="h-8 w-40"
                              />
                            ) : (
                              <div className="flex items-center gap-2">
                                {agency.agency_name}
                                {agency.approved && !agency.owner_user_id && (
                                  <Badge
                                    variant="destructive"
                                    className="flex items-center gap-1 text-xs whitespace-nowrap"
                                    title="Approved but no owner assigned — vehicles won't appear in search"
                                  >
                                    <AlertTriangle className="h-3 w-3" />
                                    No Owner
                                  </Badge>
                                )}
                              </div>
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
                            {editingId === agency.id ? (
                              <Select
                                value={
                                  (editData.owner_user_id as string | undefined) ?? OWNER_UNASSIGNED
                                }
                                onValueChange={(v) =>
                                  setEditData({ ...editData, owner_user_id: v })
                                }
                              >
                                <SelectTrigger className="h-8 w-56">
                                  <SelectValue placeholder="Unassigned" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value={OWNER_UNASSIGNED}>Unassigned</SelectItem>
                                  {profileOptions.map((p) => (
                                    <SelectItem key={p.user_id} value={p.user_id}>
                                      {p.business_name} — {p.contact_email}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : agency.owner_user_id ? (
                              <div className="flex items-center gap-2">
                                <span>{profilesByUserId.get(agency.owner_user_id)?.business_name || `${agency.owner_user_id.slice(0, 8)}…`}</span>
                                <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => openAssignDialog(agency)}>
                                  Change
                                </Button>
                              </div>
                            ) : (
                              <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={() => openAssignDialog(agency)}>
                                <UserPlus className="h-3 w-3" /> Assign
                              </Button>
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
                            <div className="flex gap-1 justify-end">
                              {editingId === agency.id ? (
                                <>
                                  <Button size="icon" variant="ghost" onClick={saveEdit}>
                                    <Save className="h-4 w-4" />
                                  </Button>
                                  <Button size="icon" variant="ghost" onClick={() => setEditingId(null)}>
                                    <X className="h-4 w-4" />
                                  </Button>
                                </>
                              ) : (
                                <Button size="icon" variant="ghost" onClick={() => startEdit(agency)}>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              )}
                              <CollapsibleTrigger asChild>
                                <Button
                                  size="icon"
                                  variant={expandedNotes === agency.id ? 'secondary' : 'ghost'}
                                  onClick={() => toggleNotes(agency.id)}
                                  title="Notes"
                                >
                                  <MessageSquare className="h-4 w-4" />
                                </Button>
                              </CollapsibleTrigger>
                            </div>
                          </TableCell>
                        </TableRow>
                        <CollapsibleContent asChild>
                          <tr>
                            <td colSpan={10} className="bg-muted/30 px-6 py-4 border-b">
                              <div className="space-y-4 max-w-2xl">
                                <h4 className="text-sm font-semibold text-foreground">Internal Notes</h4>

                                {/* Add note form */}
                                <div className="flex gap-2">
                                  <Textarea
                                    placeholder="Add a note about this agency..."
                                    value={newNoteText}
                                    onChange={(e) => setNewNoteText(e.target.value)}
                                    className="min-h-[60px] text-sm"
                                  />
                                  <Button
                                    size="sm"
                                    onClick={() => addNote(agency.id)}
                                    disabled={!newNoteText.trim() || addingNote}
                                    className="self-end"
                                  >
                                    <Send className="h-4 w-4 mr-1" /> Add
                                  </Button>
                                </div>

                                {/* Existing notes */}
                                {notesMap[agency.id]?.length ? (
                                  <div className="space-y-2">
                                    {notesMap[agency.id].map((note) => (
                                      <div key={note.id} className="rounded-md border bg-card p-3 text-sm">
                                        <div className="flex items-center justify-between mb-1">
                                          <span className="font-medium text-foreground">{note.admin_email}</span>
                                          <span className="text-xs text-muted-foreground">
                                            {format(new Date(note.created_at), 'MMM d, yyyy h:mm a')}
                                          </span>
                                        </div>
                                        <p className="text-muted-foreground whitespace-pre-wrap">{note.note_text}</p>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-muted-foreground italic">No notes yet.</p>
                                )}
                              </div>
                            </td>
                          </tr>
                        </CollapsibleContent>
                      </>
                    </Collapsible>
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

      {/* Assign Owner Dialog */}
      <Dialog open={!!assignTarget} onOpenChange={(open) => !open && setAssignTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Owner</DialogTitle>
            <DialogDescription>
              Search for a user profile to assign as the owner of <strong>{assignTarget?.agency_name}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={assignSearch}
                onChange={(e) => setAssignSearch(e.target.value)}
                className="pl-10"
                autoFocus
              />
            </div>
            <div className="max-h-56 overflow-y-auto rounded-md border">
              {assignFilteredProfiles.length === 0 ? (
                <p className="text-sm text-muted-foreground p-3 text-center">No profiles found.</p>
              ) : (
                assignFilteredProfiles.map((p) => (
                  <button
                    key={p.user_id}
                    type="button"
                    onClick={() => setAssignSelected(p)}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors ${
                      assignSelected?.user_id === p.user_id ? 'bg-accent font-medium' : ''
                    }`}
                  >
                    <div className="font-medium text-foreground">{p.business_name}</div>
                    <div className="text-xs text-muted-foreground">{p.contact_email}</div>
                  </button>
                ))
              )}
            </div>
          </div>
          <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-between gap-2">
            <div className="flex gap-2">
              {assignTarget?.owner_user_id && (
                <Button
                  variant="destructive"
                  onClick={confirmUnassignOwner}
                  disabled={assigning}
                >
                  {assigning ? 'Removing…' : 'Remove Owner'}
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setAssignTarget(null)}>Cancel</Button>
              <Button onClick={confirmAssignOwner} disabled={!assignSelected || assigning}>
                {assigning ? 'Assigning…' : 'Confirm'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAgencies;
