import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

export const TermsAcceptanceDialog = () => {
  const { user } = useAuth();
  const [show, setShow] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentVersion, setCurrentVersion] = useState("1.0");
  const checked = useRef(false);

  useEffect(() => {
    if (!user || checked.current) return;
    checked.current = true;
    checkAcceptance();
  }, [user]);

  const checkAcceptance = async () => {
    if (!user) return;
    // Get current terms version
    const { data: setting } = await supabase
      .from("platform_settings")
      .select("value")
      .eq("key", "terms_version")
      .maybeSingle();
    const version = setting?.value || "1.0";
    setCurrentVersion(version);

    // Check if user accepted this version
    const { data: acceptance } = await supabase
      .from("terms_acceptance")
      .select("id")
      .eq("user_id", user.id)
      .eq("terms_version", version)
      .maybeSingle();

    if (!acceptance) setShow(true);
  };

  const handleAccept = async () => {
    if (!user || !agreed) return;
    setSubmitting(true);
    const { error } = await supabase.from("terms_acceptance").insert({
      user_id: user.id,
      terms_version: currentVersion,
    });
    if (error) {
      toast({ title: "Error", description: "Failed to record acceptance", variant: "destructive" });
    } else {
      setShow(false);
      toast({ title: "Terms accepted", description: "Thank you for accepting our terms." });
    }
    setSubmitting(false);
  };

  if (!user) return null;

  return (
    <Dialog open={show} onOpenChange={() => {}}>
      <DialogContent className="max-w-md [&>button]:hidden flex flex-col max-h-[85vh]" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Terms of Service & Privacy Policy</DialogTitle>
          <DialogDescription>
            Please review and accept our terms to continue using Skill Serve (v{currentVersion}).
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1 min-h-0 border rounded-md p-3 text-sm text-muted-foreground">
          <p className="mb-2">By using Skill Serve, you agree to our Terms of Service and Privacy Policy. These documents govern your use of the platform, including:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Account registration and responsibilities</li>
            <li>Service booking and payment terms</li>
            <li>Data collection, usage, and protection</li>
            <li>Dispute resolution procedures</li>
            <li>Limitation of liability</li>
            <li>Intellectual property rights</li>
            <li>Prohibited conduct and termination</li>
          </ul>
          <p className="mt-2">
            Full documents: <Link to="/terms" className="text-primary underline" onClick={() => window.open("/terms", "_blank")}>Terms of Service</Link> | <Link to="/privacy" className="text-primary underline" onClick={() => window.open("/privacy", "_blank")}>Privacy Policy</Link>
          </p>
        </ScrollArea>
        <div className="flex-shrink-0 space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <Checkbox id="agree" checked={agreed} onCheckedChange={(v) => setAgreed(v === true)} />
            <label htmlFor="agree" className="text-sm cursor-pointer">
              I have read and agree to the Terms of Service and Privacy Policy
            </label>
          </div>
          <Button onClick={handleAccept} disabled={!agreed || submitting} className="w-full">
            {submitting ? "Accepting..." : "Accept & Continue"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
