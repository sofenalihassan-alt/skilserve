import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import Seo from "@/components/Seo";

const PrivacyPolicy = () => {
  const [version, setVersion] = useState("1.0");

  useEffect(() => {
    supabase.from("platform_settings").select("value").eq("key", "terms_version").maybeSingle()
      .then(({ data }) => { if (data) setVersion(data.value); });
  }, []);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Seo title={"Privacy Policy | Skill Serve"} description={"Learn how Skill Serve collects, uses and protects your personal data when you book or provide local services on our platform."} />
      <Header />
      <div className="container mx-auto px-4 py-10 max-w-3xl prose prose-sm dark:prose-invert">
        <h1>Privacy Policy</h1>
        <p className="text-muted-foreground text-sm">Version {version} — Last updated: April 2026</p>

        <h2>1. Information We Collect</h2>
        <p>We collect information you provide during registration (name, email, phone number), profile information (address, avatar), service provider details (business name, category, rates), booking and transaction data, messages between users, reviews and feedback, and device/browser information for analytics.</p>

        <h2>2. How We Use Your Information</h2>
        <p>We use your data to: provide and improve the Platform; process bookings and facilitate communication; send notifications about bookings, messages, and platform updates; verify service provider credentials; ensure platform security; comply with legal obligations.</p>

        <h2>3. Information Sharing</h2>
        <p>We share your information with: service providers (for bookings you initiate); other users (public profile information only); law enforcement (when required by law). We do NOT sell your personal data to third parties.</p>

        <h2>4. Data Storage & Security</h2>
        <p>Your data is stored securely using industry-standard encryption. We use secure HTTPS connections, encrypted database storage, role-based access controls, and regular security audits. However, no method of transmission over the Internet is 100% secure.</p>

        <h2>5. Cookies & Tracking</h2>
        <p>We use essential cookies for authentication and session management. We use local storage for user preferences (theme, language). We do not use third-party advertising trackers.</p>

        <h2>6. Your Rights</h2>
        <p>You have the right to: access your personal data; correct inaccurate information; request deletion of your account and data; export your data; withdraw consent for optional data processing. To exercise these rights, contact us through our support page.</p>

        <h2>7. Data Retention</h2>
        <p>We retain your data for as long as your account is active. Booking records are kept for 3 years for legal compliance. Messages are retained until deleted by users. After account deletion, data is removed within 30 days except where retention is required by law.</p>

        <h2>8. Children's Privacy</h2>
        <p>Skill Serve is not intended for users under 18. We do not knowingly collect information from minors. If we learn we have collected data from a child under 18, we will delete it promptly.</p>

        <h2>9. Third-Party Services</h2>
        <p>We use third-party services for authentication, database management, file storage, and mapping. These services have their own privacy policies, and we encourage you to review them.</p>

        <h2>10. Push Notifications</h2>
        <p>With your consent, we send push notifications for new messages, booking updates, and important platform announcements. You can disable these in your browser settings at any time.</p>

        <h2>11. International Data</h2>
        <p>Skill Serve operates primarily in Pakistan. If you access the Platform from outside Pakistan, your data may be transferred to and processed in Pakistan in accordance with local data protection laws.</p>

        <h2>12. Changes to This Policy</h2>
        <p>We may update this Privacy Policy from time to time. Users will be notified of significant changes and required to re-accept the updated policy.</p>

        <h2>13. Contact Us</h2>
        <p>For privacy-related questions or concerns, visit our <a href="/contact" className="text-primary">Contact page</a> or email us directly.</p>
      </div>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
