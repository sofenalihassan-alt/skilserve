import jsPDF from "jspdf";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface InvoiceData {
  bookingId: string;
  scheduledDate: string;
  providerName: string;
  providerCategory: string;
  customerName: string;
  serviceDescription: string;
  duration: number;
  hourlyRate: number;
  totalAmount: number;
  status: string;
}

const generateInvoice = (data: InvoiceData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(88, 28, 235); // primary purple
  doc.rect(0, 0, pageWidth, 40, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("SKILL SERVE", 20, 25);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Service Receipt / Invoice", pageWidth - 20, 25, { align: "right" });

  // Invoice details
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(10);
  let y = 55;

  doc.setFont("helvetica", "bold");
  doc.text("Invoice #", 20, y);
  doc.setFont("helvetica", "normal");
  doc.text(data.bookingId.slice(0, 8).toUpperCase(), 70, y);

  doc.setFont("helvetica", "bold");
  doc.text("Date:", pageWidth - 80, y);
  doc.setFont("helvetica", "normal");
  doc.text(new Date(data.scheduledDate).toLocaleDateString("en-PK"), pageWidth - 55, y);

  y += 10;
  doc.setFont("helvetica", "bold");
  doc.text("Status:", 20, y);
  doc.setFont("helvetica", "normal");
  doc.text(data.status.toUpperCase(), 70, y);

  // Divider
  y += 15;
  doc.setDrawColor(200, 200, 200);
  doc.line(20, y, pageWidth - 20, y);

  // Provider & Customer
  y += 12;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Service Provider", 20, y);
  doc.text("Customer", pageWidth / 2 + 10, y);

  y += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(data.providerName, 20, y);
  doc.text(data.customerName, pageWidth / 2 + 10, y);
  y += 6;
  doc.setTextColor(120, 120, 120);
  doc.text(data.providerCategory, 20, y);
  doc.setTextColor(60, 60, 60);

  // Service details table
  y += 20;
  doc.setFillColor(245, 245, 250);
  doc.rect(20, y, pageWidth - 40, 10, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("DESCRIPTION", 25, y + 7);
  doc.text("DURATION", 120, y + 7);
  doc.text("RATE", 150, y + 7);
  doc.text("AMOUNT", pageWidth - 25, y + 7, { align: "right" });

  y += 15;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const desc = data.serviceDescription.length > 50
    ? data.serviceDescription.slice(0, 50) + "..."
    : data.serviceDescription;
  doc.text(desc, 25, y + 5);
  doc.text(`${data.duration} hr${data.duration > 1 ? "s" : ""}`, 120, y + 5);
  doc.text(`Rs. ${data.hourlyRate}`, 150, y + 5);
  doc.text(`Rs. ${data.totalAmount}`, pageWidth - 25, y + 5, { align: "right" });

  // Total
  y += 20;
  doc.setDrawColor(200, 200, 200);
  doc.line(120, y, pageWidth - 20, y);
  y += 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Total:", 130, y);
  doc.text(`Rs. ${data.totalAmount}`, pageWidth - 25, y, { align: "right" });

  // Footer
  y = doc.internal.pageSize.getHeight() - 30;
  doc.setDrawColor(200, 200, 200);
  doc.line(20, y, pageWidth - 20, y);
  y += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text("This is a computer-generated receipt. No signature required.", pageWidth / 2, y, { align: "center" });
  doc.text(`Generated on ${new Date().toLocaleDateString("en-PK")} via Skill Serve`, pageWidth / 2, y + 5, { align: "center" });

  doc.save(`SkillServe-Receipt-${data.bookingId.slice(0, 8).toUpperCase()}.pdf`);
};

interface Props {
  booking: {
    id: string;
    scheduled_date: string;
    service_description: string;
    estimated_duration: number;
    total_amount: number | null;
    status: string;
    provider?: {
      business_name: string;
      category: string;
      hourly_rate: number;
    };
    profile?: {
      full_name: string;
    };
  };
  customerName?: string;
}

export const InvoiceGenerator = ({ booking, customerName }: Props) => {
  const handleDownload = () => {
    generateInvoice({
      bookingId: booking.id,
      scheduledDate: booking.scheduled_date,
      providerName: booking.provider?.business_name || "Provider",
      providerCategory: booking.provider?.category || "Service",
      customerName: customerName || booking.profile?.full_name || "Customer",
      serviceDescription: booking.service_description,
      duration: booking.estimated_duration,
      hourlyRate: booking.provider?.hourly_rate || 0,
      totalAmount: booking.total_amount || (booking.provider?.hourly_rate || 0) * booking.estimated_duration,
      status: booking.status,
    });
  };

  return (
    <Button size="sm" variant="outline" onClick={handleDownload} className="gap-2">
      <Download className="h-4 w-4" strokeWidth={1.5} />
      Receipt
    </Button>
  );
};
