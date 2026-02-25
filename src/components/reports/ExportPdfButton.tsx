import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ReportFilters } from "@/hooks/useReportFilters";

interface ExportPdfButtonProps {
  filters: ReportFilters;
  targetId?: string;
}

export const ExportPdfButton = ({ filters, targetId = "report-content" }: ExportPdfButtonProps) => {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const [html2canvasModule, jsPDFModule] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      const html2canvas = html2canvasModule.default;
      const { jsPDF } = jsPDFModule;

      const el = document.getElementById(targetId);
      if (!el) return;

      // Temporarily hide elements not wanted in PDF
      const hiddenEls = el.querySelectorAll<HTMLElement>("[data-pdf-hide]");
      hiddenEls.forEach((e) => { e.style.visibility = "hidden"; });

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      hiddenEls.forEach((e) => { e.style.visibility = ""; });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? "landscape" : "portrait",
        unit: "px",
        format: [canvas.width / 2, canvas.height / 2],
      });

      pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2);

      const filename = `pakam-report-${format(filters.from, "yyyy-MM-dd")}-to-${format(filters.to, "yyyy-MM-dd")}.pdf`;
      pdf.save(filename);
    } catch (err) {
      console.error("PDF export failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-2 h-9"
      onClick={handleExport}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      {loading ? "Exporting…" : "Export PDF"}
    </Button>
  );
};
