import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, Eye, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";

interface VerificationDoc {
  id: string;
  user_id: string;
  provider_id: string;
  doc_type: string;
  file_path: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
  provider?: { business_name: string };
  profile?: { full_name: string };
}

export const AdminVerificationTab = () => {
  const { toast } = useToast();
  const [docs, setDocs] = useState<VerificationDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<VerificationDoc | null>(null);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [filter, setFilter] = useState<string>("pending");

  const fetchDocs = async () => {
    setLoading(true);
    let q = supabase.from("verification_documents").select("*").order("created_at", { ascending: false });
    if (filter !== "all") q = q.eq("status", filter as any);
    const { data } = await q;
    if (!data) {
      setDocs([]);
      setLoading(false);
      return;
    }
    // hydrate provider + profile names
    const providerIds = [...new Set(data.map((d) => d.provider_id))];
    const userIds = [...new Set(data.map((d) => d.user_id))];
    const [providersRes, profilesRes] = await Promise.all([
      supabase.from("service_providers").select("id, business_name").in("id", providerIds),
      supabase.from("profiles").select("id, full_name").in("id", userIds),
    ]);
    const pmap = new Map((providersRes.data || []).map((p) => [p.id, p]));
    const umap = new Map((profilesRes.data || []).map((p) => [p.id, p]));
    setDocs(
      data.map((d) => ({
        ...d,
        provider: pmap.get(d.provider_id) as any,
        profile: umap.get(d.user_id) as any,
      }))
    );
    setLoading(false);
  };

  useEffect(() => {
    fetchDocs();
  }, [filter]);

  const openDoc = async (doc: VerificationDoc) => {
    setSelectedDoc(doc);
    setAdminNotes(doc.admin_notes || "");
    const { data } = await supabase.storage.from("verification-docs").createSignedUrl(doc.file_path, 600);
    setSignedUrl(data?.signedUrl || null);
  };

  const reviewDoc = async (status: "verified" | "rejected") => {
    if (!selectedDoc) return;
    const { data: { user } } = await supabase.auth.getUser();
    await supabase
      .from("verification_documents")
      .update({
        status,
        admin_notes: adminNotes || null,
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", selectedDoc.id);

    // If all required docs verified, mark provider as verified
    if (status === "verified") {
      const { data: providerDocs } = await supabase
        .from("verification_documents")
        .select("doc_type, status")
        .eq("provider_id", selectedDoc.provider_id);
      const required = ["cnic_front", "cnic_back", "selfie_with_id"];
      const allVerified = required.every((r) =>
        providerDocs?.some((d) => d.doc_type === r && d.status === "verified")
      );
      if (allVerified) {
        await supabase
          .from("service_providers")
          .update({ verification_status: "verified" })
          .eq("id", selectedDoc.provider_id);
      }
    } else {
      await supabase
        .from("service_providers")
        .update({ verification_status: "rejected" })
        .eq("id", selectedDoc.provider_id);
    }

    toast({ title: `Document ${status}` });
    setSelectedDoc(null);
    setSignedUrl(null);
    fetchDocs();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Provider Verification</h2>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending Review</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : docs.length === 0 ? (
        <Card><CardContent className="py-10 text-center text-muted-foreground">No documents.</CardContent></Card>
      ) : (
        <div className="grid gap-3">
          {docs.map((doc) => (
            <Card key={doc.id}>
              <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{doc.provider?.business_name || "Provider"}</p>
                  <p className="text-sm text-muted-foreground">
                    {doc.profile?.full_name} — {doc.doc_type.replace(/_/g, " ")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(doc.created_at), "MMM dd, yyyy HH:mm")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={doc.status === "verified" ? "default" : doc.status === "rejected" ? "destructive" : "outline"}>
                    {doc.status}
                  </Badge>
                  <Button size="sm" variant="outline" onClick={() => openDoc(doc)}>
                    <Eye className="h-4 w-4 mr-1" /> Review
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selectedDoc} onOpenChange={(o) => !o && setSelectedDoc(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Document</DialogTitle>
          </DialogHeader>
          {selectedDoc && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <strong>{selectedDoc.provider?.business_name}</strong> — {selectedDoc.doc_type.replace(/_/g, " ")}
              </div>
              {signedUrl ? (
                selectedDoc.file_path.endsWith(".pdf") ? (
                  <iframe src={signedUrl} className="w-full h-[500px] rounded-lg border border-border" title="Document" />
                ) : (
                  <img src={signedUrl} alt="Document" className="w-full max-h-[500px] object-contain rounded-lg border border-border" />
                )
              ) : (
                <p>Loading…</p>
              )}
              <div className="space-y-2">
                <Label>Admin notes (shown to provider on rejection)</Label>
                <Textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} rows={2} />
              </div>
              <DialogFooter>
                <Button variant="destructive" onClick={() => reviewDoc("rejected")}>
                  <XCircle className="h-4 w-4 mr-1" /> Reject
                </Button>
                <Button onClick={() => reviewDoc("verified")}>
                  <CheckCircle className="h-4 w-4 mr-1" /> Approve
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface Dispute {
  id: string;
  booking_id: string;
  raised_by: string;
  against_user_id: string;
  reason: string;
  description: string;
  evidence_urls: string[];
  status: string;
  admin_notes: string | null;
  resolution: string | null;
  created_at: string;
  raised_by_profile?: { full_name: string };
}

export const AdminDisputesTab = () => {
  const { toast } = useToast();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Dispute | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [resolution, setResolution] = useState("");
  const [newStatus, setNewStatus] = useState<string>("investigating");
  const [filter, setFilter] = useState<string>("pending");
  const [evidenceUrls, setEvidenceUrls] = useState<string[]>([]);

  const fetchDisputes = async () => {
    setLoading(true);
    let q = supabase.from("disputes").select("*").order("created_at", { ascending: false });
    if (filter !== "all") q = q.eq("status", filter as any);
    const { data } = await q;
    if (!data) {
      setDisputes([]);
      setLoading(false);
      return;
    }
    const userIds = [...new Set(data.map((d) => d.raised_by))];
    const { data: profiles } = await supabase.from("profiles").select("id, full_name").in("id", userIds);
    const map = new Map((profiles || []).map((p) => [p.id, p]));
    setDisputes(data.map((d) => ({ ...d, raised_by_profile: map.get(d.raised_by) as any })));
    setLoading(false);
  };

  useEffect(() => {
    fetchDisputes();
  }, [filter]);

  const openDispute = async (d: Dispute) => {
    setSelected(d);
    setAdminNotes(d.admin_notes || "");
    setResolution(d.resolution || "");
    setNewStatus(d.status);
    if (d.evidence_urls?.length) {
      const urls: string[] = [];
      for (const path of d.evidence_urls) {
        const { data } = await supabase.storage.from("dispute-evidence").createSignedUrl(path, 600);
        if (data?.signedUrl) urls.push(data.signedUrl);
      }
      setEvidenceUrls(urls);
    } else {
      setEvidenceUrls([]);
    }
  };

  const updateDispute = async () => {
    if (!selected) return;
    const { data: { user } } = await supabase.auth.getUser();
    await supabase
      .from("disputes")
      .update({
        status: newStatus as any,
        admin_notes: adminNotes || null,
        resolution: resolution || null,
        resolved_by: ["resolved", "rejected"].includes(newStatus) ? user?.id : null,
        resolved_at: ["resolved", "rejected"].includes(newStatus) ? new Date().toISOString() : null,
      })
      .eq("id", selected.id);
    toast({ title: "Dispute updated" });
    setSelected(null);
    fetchDisputes();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-xl font-semibold">Disputes</h2>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="investigating">Investigating</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : disputes.length === 0 ? (
        <Card><CardContent className="py-10 text-center text-muted-foreground">No disputes.</CardContent></Card>
      ) : (
        <div className="grid gap-3">
          {disputes.map((d) => (
            <Card key={d.id}>
              <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">{d.reason}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2">{d.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Raised by {d.raised_by_profile?.full_name || "Unknown"} • {format(new Date(d.created_at), "MMM dd, yyyy")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={d.status === "resolved" ? "default" : d.status === "rejected" ? "destructive" : "outline"}>
                    {d.status}
                  </Badge>
                  <Button size="sm" variant="outline" onClick={() => openDispute(d)}>
                    <Eye className="h-4 w-4 mr-1" /> Review
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Dispute Details</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Reason</p>
                <p className="font-medium">{selected.reason}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="text-sm whitespace-pre-wrap">{selected.description}</p>
              </div>
              {evidenceUrls.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Evidence</p>
                  <div className="grid grid-cols-2 gap-2">
                    {evidenceUrls.map((u, i) => (
                      <a key={i} href={u} target="_blank" rel="noreferrer" className="block">
                        <img src={u} alt={`Evidence ${i + 1}`} className="w-full h-32 object-cover rounded-lg border border-border" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="investigating">Investigating</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Internal admin notes</Label>
                <Textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} rows={2} />
              </div>
              <div className="space-y-2">
                <Label>Resolution (visible to parties)</Label>
                <Textarea value={resolution} onChange={(e) => setResolution(e.target.value)} rows={3} />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelected(null)}>Cancel</Button>
                <Button onClick={updateDispute}>Save</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
