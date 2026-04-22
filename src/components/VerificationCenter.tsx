import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, Upload, FileCheck2, Clock, X, CheckCircle2, AlertCircle } from "lucide-react";

type DocType = "cnic_front" | "cnic_back" | "selfie_with_id" | "license" | "certificate";

interface VerificationDoc {
  id: string;
  doc_type: DocType;
  file_path: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
}

const DOC_TYPES: { type: DocType; label: string; required: boolean; description: string }[] = [
  { type: "cnic_front", label: "ID / CNIC — Front", required: true, description: "Clear photo of the front side" },
  { type: "cnic_back", label: "ID / CNIC — Back", required: true, description: "Clear photo of the back side" },
  { type: "selfie_with_id", label: "Selfie holding your ID", required: true, description: "Hold your ID next to your face" },
  { type: "license", label: "Trade license (optional)", required: false, description: "If you have a professional license" },
  { type: "certificate", label: "Skill certificate (optional)", required: false, description: "Any relevant training certificate" },
];

interface Props {
  providerId: string;
  verificationStatus: string;
}

export const VerificationCenter = ({ providerId, verificationStatus }: Props) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [docs, setDocs] = useState<VerificationDoc[]>([]);
  const [uploading, setUploading] = useState<DocType | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDocs = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("verification_documents")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setDocs((data as VerificationDoc[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchDocs();
  }, [user]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, docType: DocType) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Maximum size is 5MB", variant: "destructive" });
      return;
    }

    setUploading(docType);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${docType}-${Date.now()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("verification-docs")
        .upload(path, file, { upsert: false });
      if (upErr) throw upErr;

      const { error: dbErr } = await supabase.from("verification_documents").insert({
        provider_id: providerId,
        user_id: user.id,
        doc_type: docType,
        file_path: path,
        status: "pending",
      });
      if (dbErr) throw dbErr;

      // Mark provider as pending verification
      await supabase
        .from("service_providers")
        .update({ verification_status: "pending" })
        .eq("id", providerId);

      toast({ title: "Uploaded", description: "Your document is awaiting review." });
      fetchDocs();
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(null);
      e.target.value = "";
    }
  };

  const removeDoc = async (doc: VerificationDoc) => {
    await supabase.storage.from("verification-docs").remove([doc.file_path]);
    await supabase.from("verification_documents").delete().eq("id", doc.id);
    fetchDocs();
  };

  const getDocFor = (type: DocType) => docs.find((d) => d.doc_type === type);

  const statusBadge = () => {
    switch (verificationStatus) {
      case "verified":
        return (
          <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 gap-1">
            <ShieldCheck className="h-3.5 w-3.5" /> Verified
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3.5 w-3.5" /> Under review
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="h-3.5 w-3.5" /> Rejected
          </Badge>
        );
      default:
        return <Badge variant="secondary">Not verified</Badge>;
    }
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Identity Verification</CardTitle>
              <CardDescription>Build trust with customers — get the Verified badge.</CardDescription>
            </div>
          </div>
          {statusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {DOC_TYPES.map((d) => {
          const existing = getDocFor(d.type);
          return (
            <div
              key={d.type}
              className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg border border-border/60 bg-background/30"
            >
              <div className="flex-1 min-w-[200px]">
                <div className="flex items-center gap-2">
                  <Label className="font-medium">{d.label}</Label>
                  {d.required && <span className="text-xs text-destructive">*</span>}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{d.description}</p>
                {existing?.admin_notes && (
                  <p className="text-xs text-destructive mt-1">Admin note: {existing.admin_notes}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {existing ? (
                  <>
                    <Badge
                      variant="outline"
                      className={
                        existing.status === "verified"
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                          : existing.status === "rejected"
                          ? "bg-destructive/10 text-destructive border-destructive/30"
                          : ""
                      }
                    >
                      {existing.status === "verified" ? (
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                      ) : existing.status === "pending" ? (
                        <Clock className="h-3 w-3 mr-1" />
                      ) : (
                        <FileCheck2 className="h-3 w-3 mr-1" />
                      )}
                      {existing.status}
                    </Badge>
                    {existing.status === "pending" && (
                      <Button size="icon" variant="ghost" onClick={() => removeDoc(existing)}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </>
                ) : (
                  <div>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      id={`upload-${d.type}`}
                      className="hidden"
                      onChange={(e) => handleUpload(e, d.type)}
                      disabled={uploading === d.type}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      asChild
                      disabled={uploading === d.type}
                      className="gap-1.5"
                    >
                      <label htmlFor={`upload-${d.type}`} className="cursor-pointer">
                        <Upload className="h-3.5 w-3.5" />
                        {uploading === d.type ? "Uploading…" : "Upload"}
                      </label>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
