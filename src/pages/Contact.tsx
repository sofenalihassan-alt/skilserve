import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Phone, Mail, Clock, MessageCircle, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  subject: z.string().trim().min(1, "Subject is required").max(200),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(2000),
});

const faqs = [
  { q: "How do I book a service?", a: "Browse providers on the Find Services page, select a provider, and click 'Book Now' to submit a booking request." },
  { q: "How do I become a service provider?", a: "Click 'Become a Provider' in the navigation, fill in your business details, and submit for admin approval." },
  { q: "How long does provider approval take?", a: "Admin reviews new registrations regularly. You'll be notified once your account is approved or if additional information is needed." },
  { q: "How can I cancel a booking?", a: "Go to My Bookings, find the booking you want to cancel, and click the Cancel button. Note that confirmed bookings may have cancellation terms." },
  { q: "How do I leave a review?", a: "After a booking is marked as completed, you'll be able to leave a review from the Bookings page." },
  { q: "Is my personal data safe?", a: "Yes. We use industry-standard encryption and security measures. Read our Privacy Policy for full details." },
  { q: "How do I report a problem with a service?", a: "Use this contact form to report any issues. Include your booking details for faster resolution." },
];

const Contact = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    supabase.from("platform_settings").select("key, value")
      .in("key", ["contact_phone", "contact_email", "support_hours"])
      .then(({ data }) => {
        const map: Record<string, string> = {};
        (data || []).forEach((r) => { map[r.key] = r.value; });
        setSettings(map);
      });
  }, []);

  const handleSubmit = async () => {
    const result = contactSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((e) => { fieldErrors[e.path[0] as string] = e.message; });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);

    if (user) {
      const { error } = await supabase.from("website_feedback").insert({
        user_id: user.id,
        rating: 0,
        page: "contact",
        comment: `[${form.subject}] From: ${form.name} (${form.email})\n\n${form.message}`,
      });
      if (error) {
        toast({ title: "Error", description: "Failed to submit. Please try again.", variant: "destructive" });
      } else {
        toast({ title: "Message sent!", description: "We'll get back to you soon." });
        setForm({ name: "", email: "", subject: "", message: "" });
      }
    } else {
      toast({ title: "Please sign in", description: "You need to be logged in to submit a message.", variant: "destructive" });
    }
    setSubmitting(false);
  };

  const phone = settings.contact_phone || "03024942710";
  const email = settings.contact_email || "alihassan39se@gmail.com";
  const hours = settings.support_hours || "Mon-Sat 9AM-6PM PKT";

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        <h1 className="text-3xl font-bold mb-2">Contact Us</h1>
        <p className="text-muted-foreground mb-8">Have a question, concern, or need help? Reach out to us.</p>

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <Card>
            <CardContent className="p-5 flex items-start gap-3">
              <Phone className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-sm">Phone</p>
                <a href={`tel:${phone}`} className="text-sm text-muted-foreground hover:text-primary">{phone}</a>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 flex items-start gap-3">
              <Mail className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-sm">Email</p>
                <a href={`mailto:${email}`} className="text-sm text-muted-foreground hover:text-primary">{email}</a>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 flex items-start gap-3">
              <Clock className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-sm">Support Hours</p>
                <p className="text-sm text-muted-foreground">{hours}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Send className="h-5 w-5" /> Send a Message</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
                {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
              </div>
              <div>
                <Label>Email</Label>
                <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="your@email.com" type="email" />
                {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
              </div>
              <div>
                <Label>Subject</Label>
                <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="What's this about?" />
                {errors.subject && <p className="text-xs text-destructive mt-1">{errors.subject}</p>}
              </div>
              <div>
                <Label>Message</Label>
                <Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Describe your issue or question..." rows={5} />
                {errors.message && <p className="text-xs text-destructive mt-1">{errors.message}</p>}
              </div>
              <Button onClick={handleSubmit} disabled={submitting} className="w-full">
                {submitting ? "Sending..." : "Send Message"}
              </Button>
              <a
                href={`https://wa.me/${phone.replace(/^0/, "92")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary"
              >
                <MessageCircle className="h-4 w-4" /> Or chat with us on WhatsApp
              </a>
            </CardContent>
          </Card>

          {/* FAQ */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="text-left text-sm">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Contact;
