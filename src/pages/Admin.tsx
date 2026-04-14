import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import {
  LayoutDashboard, Users, Briefcase, CalendarDays, MessageSquareText,
  Star, Settings, CheckCircle, XCircle, Eye, Trash2, Plus, Edit,
  Shield, TrendingUp, DollarSign, UserCheck, AlertTriangle
} from "lucide-react";
import { format } from "date-fns";

// ─── Dashboard Tab ───
const DashboardTab = () => {
  const [stats, setStats] = useState({ users: 0, providers: 0, pendingProviders: 0, bookings: 0, revenue: 0 });
  const [bookingCounts, setBookingCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const [profilesRes, providersRes, pendingRes, bookingsRes, revenueRes] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('service_providers').select('id', { count: 'exact', head: true }).eq('is_approved', true),
      supabase.from('service_providers').select('id', { count: 'exact', head: true }).eq('is_approved', false),
      supabase.from('bookings').select('id', { count: 'exact', head: true }),
      supabase.from('bookings').select('total_amount').eq('status', 'completed'),
    ]);

    const revenue = (revenueRes.data || []).reduce((sum, b) => sum + (b.total_amount || 0), 0);
    setStats({
      users: profilesRes.count || 0,
      providers: providersRes.count || 0,
      pendingProviders: pendingRes.count || 0,
      bookings: bookingsRes.count || 0,
      revenue,
    });

    // Booking status counts
    const statuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'] as const;
    const counts: Record<string, number> = {};
    await Promise.all(statuses.map(async (s) => {
      const { count } = await supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('status', s);
      counts[s] = count || 0;
    }));
    setBookingCounts(counts);
  };

  const statCards = [
    { label: "Total Users", value: stats.users, icon: Users, color: "text-blue-500" },
    { label: "Approved Providers", value: stats.providers, icon: UserCheck, color: "text-green-500" },
    { label: "Pending Approval", value: stats.pendingProviders, icon: AlertTriangle, color: "text-yellow-500" },
    { label: "Total Bookings", value: stats.bookings, icon: CalendarDays, color: "text-purple-500" },
    { label: "Revenue (PKR)", value: `₨${stats.revenue.toLocaleString()}`, icon: DollarSign, color: "text-emerald-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <s.icon className={`h-8 w-8 ${s.color}`} />
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="text-2xl font-bold">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader><CardTitle>Booking Status Breakdown</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {Object.entries(bookingCounts).map(([status, count]) => (
              <Badge key={status} variant="outline" className="text-sm py-1 px-3">
                {status.replace('_', ' ')}: {count}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ─── Users Tab ───
const UsersTab = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    setUsers(data || []);
    setLoading(false);
  };

  const filtered = users.filter(u =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.includes(search) ||
    u.city?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <Input placeholder="Search users by name, phone, or city..." value={search} onChange={(e) => setSearch(e.target.value)} />
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-8">Loading...</TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-8">No users found</TableCell></TableRow>
                ) : filtered.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.full_name || '—'}</TableCell>
                    <TableCell>{u.phone || '—'}</TableCell>
                    <TableCell>{u.city || '—'}</TableCell>
                    <TableCell>{format(new Date(u.created_at), 'MMM d, yyyy')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ─── Providers Tab ───
const ProvidersTab = () => {
  const [providers, setProviders] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchProviders(); }, []);

  const fetchProviders = async () => {
    setLoading(true);
    const { data } = await supabase.from('service_providers')
      .select('*, profiles!service_providers_user_id_fkey(full_name, phone, avatar_url)')
      .order('created_at', { ascending: false });
    setProviders(data || []);
    setLoading(false);
  };

  const handleApprove = async (id: string) => {
    const { error } = await supabase.from('service_providers').update({ is_approved: true }).eq('id', id);
    if (error) toast({ title: "Error", description: "Failed to approve", variant: "destructive" });
    else { toast({ title: "Approved!" }); fetchProviders(); }
  };

  const handleReject = async (id: string) => {
    const { error } = await supabase.from('service_providers').update({ is_approved: false, is_active: false }).eq('id', id);
    if (error) toast({ title: "Error", description: "Failed to reject", variant: "destructive" });
    else { toast({ title: "Rejected" }); fetchProviders(); }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    const { error } = await supabase.from('service_providers').update({ is_active: !currentActive }).eq('id', id);
    if (error) toast({ title: "Error", description: "Failed to update", variant: "destructive" });
    else { fetchProviders(); }
  };

  const filtered = providers.filter(p => {
    if (filter === "pending") return !p.is_approved;
    if (filter === "approved") return p.is_approved && p.is_active;
    if (filter === "suspended") return !p.is_active;
    return true;
  });

  return (
    <div className="space-y-4">
      <Select value={filter} onValueChange={setFilter}>
        <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Providers</SelectItem>
          <SelectItem value="pending">Pending Approval</SelectItem>
          <SelectItem value="approved">Approved & Active</SelectItem>
          <SelectItem value="suspended">Suspended</SelectItem>
        </SelectContent>
      </Select>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business Name</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8">No providers found</TableCell></TableRow>
                ) : filtered.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.business_name}</TableCell>
                    <TableCell>{(p as any).profiles?.full_name || '—'}</TableCell>
                    <TableCell><Badge variant="outline">{p.category}</Badge></TableCell>
                    <TableCell>₨{p.hourly_rate}/hr</TableCell>
                    <TableCell>
                      {!p.is_approved ? (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>
                      ) : p.is_active ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">Active</Badge>
                      ) : (
                        <Badge variant="destructive">Suspended</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {!p.is_approved && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => handleApprove(p.id)}>
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleReject(p.id)}>
                              <XCircle className="h-4 w-4 text-red-500" />
                            </Button>
                          </>
                        )}
                        {p.is_approved && (
                          <Button size="sm" variant="outline" onClick={() => handleToggleActive(p.id, p.is_active)}>
                            {p.is_active ? 'Suspend' : 'Activate'}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ─── Bookings Tab ───
const BookingsTab = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    setLoading(true);
    const { data } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
    setBookings(data || []);
    setLoading(false);
  };

  const handleStatusChange = async (id: string, status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled") => {
    const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
    if (error) toast({ title: "Error", description: "Failed to update", variant: "destructive" });
    else { toast({ title: "Updated!" }); fetchBookings(); }
  };

  const filtered = bookings.filter(b => statusFilter === "all" || b.status === statusFilter);

  return (
    <div className="space-y-4">
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="confirmed">Confirmed</SelectItem>
          <SelectItem value="in_progress">In Progress</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8">No bookings found</TableCell></TableRow>
                ) : filtered.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium max-w-[200px] truncate">{b.service_description}</TableCell>
                    <TableCell>{format(new Date(b.scheduled_date), 'MMM d, yyyy')}</TableCell>
                    <TableCell>{b.total_amount ? `₨${b.total_amount}` : '—'}</TableCell>
                    <TableCell><Badge variant="outline">{b.status}</Badge></TableCell>
                    <TableCell>
                      <Select onValueChange={(val) => handleStatusChange(b.id, val as "pending" | "confirmed" | "in_progress" | "completed" | "cancelled")}>
                        <SelectTrigger className="w-32 h-8"><SelectValue placeholder="Change" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ─── Content Tab (Testimonials + Feedback) ───
const ContentTab = () => {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [editItem, setEditItem] = useState<any>(null);
  const [newItem, setNewItem] = useState({ name: '', role: '', quote: '', rating: 5 });
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    fetchTestimonials();
    fetchFeedback();
  }, []);

  const fetchTestimonials = async () => {
    const { data } = await supabase.from('testimonials').select('*').order('created_at', { ascending: false });
    setTestimonials(data || []);
  };

  const fetchFeedback = async () => {
    const { data } = await supabase.from('website_feedback').select('*').order('created_at', { ascending: false });
    setFeedback(data || []);
  };

  const handleAddTestimonial = async () => {
    const { error } = await supabase.from('testimonials').insert([newItem]);
    if (error) toast({ title: "Error", description: "Failed to add", variant: "destructive" });
    else { toast({ title: "Added!" }); setShowAdd(false); setNewItem({ name: '', role: '', quote: '', rating: 5 }); fetchTestimonials(); }
  };

  const handleUpdateTestimonial = async () => {
    if (!editItem) return;
    const { error } = await supabase.from('testimonials').update({ name: editItem.name, role: editItem.role, quote: editItem.quote, rating: editItem.rating }).eq('id', editItem.id);
    if (error) toast({ title: "Error", description: "Failed to update", variant: "destructive" });
    else { toast({ title: "Updated!" }); setEditItem(null); fetchTestimonials(); }
  };

  const handleDeleteTestimonial = async (id: string) => {
    const { error } = await supabase.from('testimonials').delete().eq('id', id);
    if (error) toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    else { toast({ title: "Deleted" }); fetchTestimonials(); }
  };

  const handleDeleteFeedback = async (id: string) => {
    const { error } = await supabase.from('website_feedback').delete().eq('id', id);
    if (error) toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    else { toast({ title: "Deleted" }); fetchFeedback(); }
  };

  return (
    <div className="space-y-6">
      {/* Testimonials */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Testimonials</CardTitle>
            <CardDescription>Manage customer testimonials shown on the homepage</CardDescription>
          </div>
          <Dialog open={showAdd} onOpenChange={setShowAdd}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Testimonial</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Name</Label><Input value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} /></div>
                <div><Label>Role</Label><Input value={newItem.role} onChange={(e) => setNewItem({ ...newItem, role: e.target.value })} /></div>
                <div><Label>Quote</Label><Textarea value={newItem.quote} onChange={(e) => setNewItem({ ...newItem, quote: e.target.value })} /></div>
                <div><Label>Rating (1-5)</Label><Input type="number" min={1} max={5} value={newItem.rating} onChange={(e) => setNewItem({ ...newItem, rating: parseInt(e.target.value) || 5 })} /></div>
                <Button onClick={handleAddTestimonial} className="w-full">Add Testimonial</Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {testimonials.map((t) => (
              <div key={t.id} className="flex items-start justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{t.name} <span className="text-muted-foreground text-sm">— {t.role}</span></p>
                  <p className="text-sm text-muted-foreground mt-1">"{t.quote}"</p>
                  <div className="flex gap-1 mt-1">{Array.from({ length: t.rating }).map((_, i) => <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />)}</div>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => setEditItem(t)}><Edit className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDeleteTestimonial(t.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Testimonial</DialogTitle></DialogHeader>
          {editItem && (
            <div className="space-y-3">
              <div><Label>Name</Label><Input value={editItem.name} onChange={(e) => setEditItem({ ...editItem, name: e.target.value })} /></div>
              <div><Label>Role</Label><Input value={editItem.role} onChange={(e) => setEditItem({ ...editItem, role: e.target.value })} /></div>
              <div><Label>Quote</Label><Textarea value={editItem.quote} onChange={(e) => setEditItem({ ...editItem, quote: e.target.value })} /></div>
              <div><Label>Rating (1-5)</Label><Input type="number" min={1} max={5} value={editItem.rating} onChange={(e) => setEditItem({ ...editItem, rating: parseInt(e.target.value) || 5 })} /></div>
              <Button onClick={handleUpdateTestimonial} className="w-full">Save Changes</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Feedback */}
      <Card>
        <CardHeader>
          <CardTitle>Website Feedback</CardTitle>
          <CardDescription>User-submitted feedback and ratings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {feedback.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No feedback yet</p>
            ) : feedback.map((f) => (
              <div key={f.id} className="flex items-start justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex gap-1">{Array.from({ length: f.rating }).map((_, i) => <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />)}</div>
                  <p className="text-sm mt-1">{f.comment || 'No comment'}</p>
                  <p className="text-xs text-muted-foreground mt-1">Page: {f.page} • {format(new Date(f.created_at), 'MMM d, yyyy')}</p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => handleDeleteFeedback(f.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ─── Settings Tab ───
const SettingsTab = () => {
  const { user } = useAuth();
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updating, setUpdating] = useState(false);
  const [platformSettings, setPlatformSettings] = useState<Record<string, string>>({});
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    supabase.from('platform_settings').select('key, value').then(({ data }) => {
      const map: Record<string, string> = {};
      (data || []).forEach((r) => { map[r.key] = r.value; });
      setPlatformSettings(map);
    });
  }, []);

  const handleUpdateEmail = async () => {
    if (!newEmail) return;
    setUpdating(true);
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else toast({ title: "Email update initiated", description: "Check your new email for confirmation." });
    setUpdating(false);
    setNewEmail('');
  };

  const handleUpdatePassword = async () => {
    if (newPassword.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      return;
    }
    setUpdating(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else toast({ title: "Password updated successfully!" });
    setUpdating(false);
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleSavePlatformSettings = async () => {
    setSavingSettings(true);
    const entries = Object.entries(platformSettings);
    for (const [key, value] of entries) {
      await supabase.from('platform_settings').update({ value, updated_at: new Date().toISOString() }).eq('key', key);
    }
    toast({ title: "Settings saved!" });
    setSavingSettings(false);
  };

  return (
    <div className="space-y-6 max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>Contact & Platform Settings</CardTitle>
          <CardDescription>These settings are displayed on the Contact page and used across the platform.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Contact Phone</Label>
            <Input value={platformSettings.contact_phone || ''} onChange={(e) => setPlatformSettings({ ...platformSettings, contact_phone: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Contact Email</Label>
            <Input value={platformSettings.contact_email || ''} onChange={(e) => setPlatformSettings({ ...platformSettings, contact_email: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Support Hours</Label>
            <Input value={platformSettings.support_hours || ''} onChange={(e) => setPlatformSettings({ ...platformSettings, support_hours: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Terms Version</Label>
            <Input value={platformSettings.terms_version || ''} onChange={(e) => setPlatformSettings({ ...platformSettings, terms_version: e.target.value })} placeholder="e.g. 1.1" />
            <p className="text-xs text-muted-foreground">Changing this will require all users to re-accept the Terms of Service.</p>
          </div>
          <Button onClick={handleSavePlatformSettings} disabled={savingSettings} size="sm">
            {savingSettings ? 'Saving...' : 'Save Settings'}
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Admin Account</CardTitle>
          <CardDescription>Current email: {user?.email}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Change Email</Label>
            <Input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="New email address" type="email" />
            <Button onClick={handleUpdateEmail} disabled={updating || !newEmail} size="sm">Update Email</Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>New Password</Label>
            <Input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} type="password" placeholder="••••••••" />
          </div>
          <div className="space-y-2">
            <Label>Confirm Password</Label>
            <Input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type="password" placeholder="••••••••" />
          </div>
          <Button onClick={handleUpdatePassword} disabled={updating || !newPassword} size="sm">Update Password</Button>
        </CardContent>
      </Card>
    </div>
  );
};

// ─── Main Admin Page ───
const Admin = () => {
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground">Manage your platform</p>
          </div>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="flex flex-wrap h-auto gap-1">
            <TabsTrigger value="dashboard" className="gap-1"><LayoutDashboard className="h-4 w-4" /> Dashboard</TabsTrigger>
            <TabsTrigger value="users" className="gap-1"><Users className="h-4 w-4" /> Users</TabsTrigger>
            <TabsTrigger value="providers" className="gap-1"><Briefcase className="h-4 w-4" /> Providers</TabsTrigger>
            <TabsTrigger value="bookings" className="gap-1"><CalendarDays className="h-4 w-4" /> Bookings</TabsTrigger>
            <TabsTrigger value="content" className="gap-1"><Star className="h-4 w-4" /> Content</TabsTrigger>
            <TabsTrigger value="settings" className="gap-1"><Settings className="h-4 w-4" /> Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard"><DashboardTab /></TabsContent>
          <TabsContent value="users"><UsersTab /></TabsContent>
          <TabsContent value="providers"><ProvidersTab /></TabsContent>
          <TabsContent value="bookings"><BookingsTab /></TabsContent>
          <TabsContent value="content"><ContentTab /></TabsContent>
          <TabsContent value="settings"><SettingsTab /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
