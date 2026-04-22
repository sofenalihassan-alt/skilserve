import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export const DeleteAccountDialog = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (confirm !== "DELETE") return;
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke("delete-account");
      if (error) throw error;
      toast({ title: "Account deleted", description: "We're sorry to see you go." });
      await signOut();
      navigate("/auth");
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="gap-2">
          <Trash2 className="h-4 w-4" />
          Delete Account
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete your account permanently?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action <strong>cannot be undone</strong>. Your profile, notifications, push subscriptions,
            verification documents, and roles will be removed. Your messages will be anonymized to keep
            chat history coherent for the other party. Your provider listing will be deactivated.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-2">
          <Label>Type <code className="px-1 py-0.5 bg-muted rounded">DELETE</code> to confirm</Label>
          <Input value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="DELETE" />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={confirm !== "DELETE" || loading}
            className="bg-destructive hover:bg-destructive/90"
          >
            {loading ? "Deleting…" : "Permanently Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
