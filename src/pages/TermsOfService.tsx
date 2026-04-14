import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

const TermsOfService = () => {
  const [version, setVersion] = useState("1.0");

  useEffect(() => {
    supabase.from("platform_settings").select("value").eq("key", "terms_version").maybeSingle()
      .then(({ data }) => { if (data) setVersion(data.value); });
  }, []);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />
      <div className="container mx-auto px-4 py-10 max-w-3xl prose prose-sm dark:prose-invert">
        <h1>Terms of Service</h1>
        <p className="text-muted-foreground text-sm">Version {version} — Last updated: April 2026</p>

        <h2>1. Acceptance of Terms</h2>
        <p>By accessing or using the Skill Serve platform ("Platform"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Platform.</p>

        <h2>2. Eligibility</h2>
        <p>You must be at least 18 years old and legally capable of entering into a binding agreement to use Skill Serve. By registering, you represent that all information provided is accurate and complete.</p>

        <h2>3. Account Responsibilities</h2>
        <p>You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use. You are responsible for all activities under your account.</p>

        <h2>4. Service Provider Obligations</h2>
        <p>Service providers must: (a) provide accurate business information; (b) maintain appropriate licenses and insurance; (c) deliver services professionally and on time; (d) comply with all applicable local laws and regulations of Pakistan. All provider registrations are subject to admin approval before activation.</p>

        <h2>5. Booking & Payment Terms</h2>
        <p>Bookings are requests for service and are subject to provider confirmation. Pricing is set by providers and displayed on their profiles. Payment terms are agreed between users and providers. Skill Serve is not responsible for payment disputes between parties. All amounts are displayed in Pakistani Rupees (PKR).</p>

        <h2>6. User Conduct</h2>
        <p>You agree not to: (a) use the Platform for illegal purposes; (b) harass, abuse, or threaten other users; (c) post false or misleading information; (d) attempt to access accounts of other users; (e) interfere with Platform operations; (f) scrape or collect user data without authorization.</p>

        <h2>7. Reviews & Ratings</h2>
        <p>Users may submit reviews for completed bookings only. Reviews must be honest and based on actual experience. Skill Serve reserves the right to remove reviews that violate these terms or contain offensive content.</p>

        <h2>8. Intellectual Property</h2>
        <p>All content, designs, logos, and software on Skill Serve are owned by us or our licensors. You may not copy, modify, distribute, or create derivative works without written permission.</p>

        <h2>9. Dispute Resolution</h2>
        <p>For disputes between users and providers, parties should first attempt to resolve the issue directly. If unresolved, contact our support team for mediation. Skill Serve's decision in disputes is advisory, not binding. For legal disputes, the courts of Pakistan shall have jurisdiction.</p>

        <h2>10. Limitation of Liability</h2>
        <p>Skill Serve acts as a marketplace connecting users with service providers. We do not guarantee the quality, safety, or legality of services provided. We are not liable for any damages arising from the use of services booked through the Platform. Our total liability shall not exceed the fees paid to us by you in the preceding 12 months.</p>

        <h2>11. Privacy</h2>
        <p>Your use of the Platform is also governed by our <a href="/privacy" className="text-primary">Privacy Policy</a>, which describes how we collect, use, and protect your personal information.</p>

        <h2>12. Termination</h2>
        <p>We may suspend or terminate your account at any time for violation of these terms, fraudulent activity, or any reason we deem necessary. You may delete your account by contacting support.</p>

        <h2>13. Modifications</h2>
        <p>We reserve the right to modify these terms at any time. Users will be required to re-accept updated terms upon the next login. Continued use after changes constitutes acceptance.</p>

        <h2>14. Governing Law</h2>
        <p>These terms are governed by the laws of the Islamic Republic of Pakistan. Any disputes shall be subject to the exclusive jurisdiction of the courts in Pakistan.</p>

        <h2>15. Contact</h2>
        <p>For questions about these terms, contact us at <a href="/contact" className="text-primary">our Contact page</a>.</p>
      </div>
      <Footer />
    </div>
  );
};

export default TermsOfService;
